import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { metric } from "./overview";

export async function getAnalytics(
  businessId: string,
  days: number,
  channel?: ChannelType,
) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);

  const period = { gte: start };
  const prevPeriod = { gte: prevStart, lt: start };
  const byChannel = channel ? { channel: { type: channel } } : {};
  const viaConv = channel ? { conversation: { channel: { type: channel } } } : {};
  const counted = { not: "CANCELLED" as const };

  const [
    conv, convPrev,
    leads, leadsPrev,
    orders, ordersPrev,
    rev, revPrev,
    convRows, chanRows, topRows,
  ] = await Promise.all([
    prisma.conversation.count({ where: { businessId, createdAt: period, ...byChannel } }),
    prisma.conversation.count({ where: { businessId, createdAt: prevPeriod, ...byChannel } }),
    prisma.lead.count({ where: { businessId, createdAt: period, ...viaConv } }),
    prisma.lead.count({ where: { businessId, createdAt: prevPeriod, ...viaConv } }),
    prisma.order.count({ where: { businessId, createdAt: period, ...viaConv } }),
    prisma.order.count({ where: { businessId, createdAt: prevPeriod, ...viaConv } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { businessId, createdAt: period, status: counted, ...viaConv } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { businessId, createdAt: prevPeriod, status: counted, ...viaConv } }),
    prisma.conversation.findMany({
      where: { businessId, createdAt: period, ...byChannel },
      select: { createdAt: true },
    }),
    prisma.channel.findMany({
      where: { businessId },
      select: {
        type: true,
        _count: { select: { conversations: true } },
        conversations: {
          where: { createdAt: period },
          select: {
            lead: { select: { id: true } },
            orders: { where: { status: counted }, select: { total: true } },
          },
        },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["nameSnapshot"],
      where: { order: { businessId, createdAt: period, status: counted, ...viaConv } },
      _sum: { qty: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
  ]);

  const BUCKETS = 8;
  const span = Math.max(1, now.getTime() - start.getTime());
  const bars = new Array(BUCKETS).fill(0);
  for (const c of convRows) {
    const i = Math.min(BUCKETS - 1, Math.floor(((c.createdAt.getTime() - start.getTime()) / span) * BUCKETS));
    if (i >= 0) bars[i] += 1;
  }

  const channels = chanRows.map((c) => {
    const conversations = c.conversations.length;
    const leadCount = c.conversations.reduce((n, x) => n + (x.lead ? 1 : 0), 0);
    const orderRows = c.conversations.flatMap((x) => x.orders);
    return {
      type: c.type,
      conversations,
      leads: leadCount,
      orders: orderRows.length,
      revenue: orderRows.reduce((n, o) => n + o.total, 0),
    };
  });

  return {
    kpis: {
      conversations: metric(conv, convPrev),
      leads: metric(leads, leadsPrev),
      orders: metric(orders, ordersPrev),
      revenue: metric(rev._sum.total ?? 0, revPrev._sum.total ?? 0),
    },
    bars,
    channels,
    topProducts: topRows.map((r, i) => ({
      rank: i + 1,
      name: r.nameSnapshot,
      sold: r._sum.qty ?? 0,
      revenue: r._sum.lineTotal ?? 0,
    })),
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
