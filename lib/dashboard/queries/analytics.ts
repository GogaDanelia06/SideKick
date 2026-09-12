import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { COUNTED_ORDER, metric } from "./metrics";

const BUCKETS = 8;
const TOP_PRODUCTS = 5;

/** Counts of `dates` in BUCKETS equal slices of the period. */
function activityBars(dates: Date[], start: Date, end: Date): number[] {
  const span = Math.max(1, end.getTime() - start.getTime());
  const bars = new Array<number>(BUCKETS).fill(0);
  for (const date of dates) {
    const i = Math.min(BUCKETS - 1, Math.floor(((date.getTime() - start.getTime()) / span) * BUCKETS));
    if (i >= 0) bars[i] += 1;
  }
  return bars;
}

type ChannelActivity = {
  type: ChannelType;
  conversations: { lead: { id: string } | null; orders: { total: number }[] }[];
};

function channelTotals(rows: ChannelActivity[]) {
  return rows.map(({ type, conversations }) => {
    const orders = conversations.flatMap((c) => c.orders);
    return {
      type,
      conversations: conversations.length,
      leads: conversations.filter((c) => c.lead).length,
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
    };
  });
}

export async function getAnalytics(businessId: string, days: number, channel?: ChannelType) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);

  const period = { gte: start };
  const prevPeriod = { gte: prevStart, lt: start };
  const byChannel = channel ? { channel: { type: channel } } : {};
  const viaConversation = channel ? { conversation: { channel: { type: channel } } } : {};
  const revenue = (createdAt: typeof period | typeof prevPeriod) =>
    prisma.order.aggregate({
      _sum: { total: true },
      where: { businessId, createdAt, status: COUNTED_ORDER, ...viaConversation },
    });

  const [conv, convPrev, leads, leadsPrev, orders, ordersPrev, rev, revPrev, convRows, chanRows, topRows] =
    await Promise.all([
      prisma.conversation.count({ where: { businessId, createdAt: period, ...byChannel } }),
      prisma.conversation.count({ where: { businessId, createdAt: prevPeriod, ...byChannel } }),
      prisma.lead.count({ where: { businessId, createdAt: period, ...viaConversation } }),
      prisma.lead.count({ where: { businessId, createdAt: prevPeriod, ...viaConversation } }),
      prisma.order.count({ where: { businessId, createdAt: period, ...viaConversation } }),
      prisma.order.count({ where: { businessId, createdAt: prevPeriod, ...viaConversation } }),
      revenue(period),
      revenue(prevPeriod),
      prisma.conversation.findMany({
        where: { businessId, createdAt: period, ...byChannel },
        select: { createdAt: true },
      }),
      prisma.channel.findMany({
        where: { businessId },
        select: {
          type: true,
          conversations: {
            where: { createdAt: period },
            select: {
              lead: { select: { id: true } },
              orders: { where: { status: COUNTED_ORDER }, select: { total: true } },
            },
          },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["nameSnapshot"],
        where: { order: { businessId, createdAt: period, status: COUNTED_ORDER, ...viaConversation } },
        _sum: { qty: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: TOP_PRODUCTS,
      }),
    ]);

  return {
    kpis: {
      conversations: metric(conv, convPrev),
      leads: metric(leads, leadsPrev),
      orders: metric(orders, ordersPrev),
      revenue: metric(rev._sum.total ?? 0, revPrev._sum.total ?? 0),
    },
    bars: activityBars(convRows.map((c) => c.createdAt), start, now),
    channels: channelTotals(chanRows),
    topProducts: topRows.map((r, i) => ({
      rank: i + 1,
      name: r.nameSnapshot,
      sold: r._sum.qty ?? 0,
      revenue: r._sum.lineTotal ?? 0,
    })),
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
