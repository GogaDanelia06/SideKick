import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";

export function getLeads(businessId: string) {
  return prisma.lead.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export function getProducts(businessId: string) {
  return prisma.product.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export function getVideos(businessId: string) {
  return prisma.video.findMany({
    where: { businessId },
    orderBy: { title: "asc" },
  });
}

export function getChannels(businessId: string) {
  return prisma.channel.findMany({
    where: { businessId },
    orderBy: { type: "asc" },
  });
}

export function getTeam(businessId: string) {
  return prisma.membership.findMany({
    where: { businessId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBilling(businessId: string, userId: string) {
  const [subscription, payments, user, plans] = await Promise.all([
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.payment.findMany({ where: { businessId }, orderBy: { date: "desc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
  ]);
  const cardName = user?.name ?? "";
  return { subscription, payments, cardName, plans };
}

export async function getAiConfig(businessId: string) {
  const [config, faqs, business] = await Promise.all([
    prisma.aiConfig.findUnique({ where: { businessId } }),
    prisma.faq.findMany({ where: { businessId }, orderBy: { question: "asc" } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { config, faqs, business };
}

const TZ = "Asia/Tbilisi";
const fmtDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ,
});
const fmtTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ,
});

export async function getOrders(businessId: string) {
  const [rows, grouped] = await Promise.all([
    prisma.order.findMany({
      where: { businessId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.groupBy({ by: ["status"], where: { businessId }, _count: { _all: true } }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;

  return {
    counts,
    orders: rows.map((o) => ({
      id: o.id,
      ref: `#${o.id.slice(-6).toUpperCase()}`,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      note: o.note,
      total: o.total,
      status: o.status,
      dateLabel: fmtDate.format(o.createdAt),
      timeLabel: fmtTime.format(o.createdAt),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.nameSnapshot,
        code: i.codeSnapshot,
        qty: i.qty,
        lineTotal: i.lineTotal,
      })),
    })),
  };
}

export type OrdersData = Awaited<ReturnType<typeof getOrders>>;
export type OrderRowData = OrdersData["orders"][number];

function metric(current: number, previous: number) {
  const deltaPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
  return { value: current, deltaPct };
}

export async function getHomeOverview(businessId: string) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const today = { gte: startToday };
  const yesterday = { gte: startYesterday, lt: startToday };
  const counted = { not: "CANCELLED" as const };

  const [
    convToday,
    convYest,
    leadsToday,
    leadsYest,
    ordersToday,
    ordersYest,
    revToday,
    revYest,
    subscription,
    channels,
    stopped,
  ] = await Promise.all([
    prisma.conversation.count({ where: { businessId, createdAt: today } }),
    prisma.conversation.count({ where: { businessId, createdAt: yesterday } }),
    prisma.lead.count({ where: { businessId, createdAt: today } }),
    prisma.lead.count({ where: { businessId, createdAt: yesterday } }),
    prisma.order.count({ where: { businessId, createdAt: today } }),
    prisma.order.count({ where: { businessId, createdAt: yesterday } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { businessId, createdAt: today, status: counted },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { businessId, createdAt: yesterday, status: counted },
    }),
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.channel.findMany({ where: { businessId }, orderBy: { type: "asc" } }),
    prisma.message.findMany({
      where: { stoppedReason: { not: null }, conversation: { businessId } },
      include: { conversation: { include: { channel: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    kpis: {
      conversations: metric(convToday, convYest),
      leads: metric(leadsToday, leadsYest),
      orders: metric(ordersToday, ordersYest),
      revenue: metric(revToday._sum.total ?? 0, revYest._sum.total ?? 0),
    },
    limit: subscription && {
      planName: subscription.plan.name,
      used: subscription.msgUsed,
      total: subscription.plan.msgLimit,
      renewsAt: subscription.renewsAt,
    },
    channels,
    stopped: stopped.map((m) => ({
      id: m.id,
      customer: m.conversation.customerName,
      text: m.text,
      reason: m.stoppedReason,
      channelType: m.conversation.channel?.type ?? null,
      minutesAgo: Math.max(0, Math.round((now.getTime() - m.createdAt.getTime()) / 60000)),
    })),
  };
}

export type HomeOverview = Awaited<ReturnType<typeof getHomeOverview>>;

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

export async function getConversations(businessId: string, channel?: ChannelType) {
  const rows = await prisma.conversation.findMany({
    where: { businessId, ...(channel ? { channel: { type: channel } } : {}) },
    include: {
      channel: { select: { type: true } },
      lead: { select: { id: true } },
      orders: { select: { id: true }, take: 1 },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true, createdAt: true, stoppedReason: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const now = Date.now();
  return rows.map((c) => {
    const last = c.messages[0];
    const name = c.customerName?.trim() || "—";
    return {
      id: c.id,
      name,
      initials: name.slice(0, 2).toUpperCase(),
      channelType: c.channel?.type ?? null,
      ring: c.orders.length ? ("order" as const) : c.lead ? ("lead" as const) : ("none" as const),
      alert: c.botPausedUntil && c.botPausedUntil > new Date()
        ? ("wait" as const)
        : last?.stoppedReason
          ? ("aierr" as const)
          : !c.aiEnabled
            ? ("aioff" as const)
            : ("none" as const),
      preview: last?.text ?? "",
      aiEnabled: c.aiEnabled,
      status: c.status,
      minutesAgo: Math.max(
        0,
        Math.round((now - (last?.createdAt ?? c.updatedAt).getTime()) / 60000),
      ),
    };
  });
}

export type ConversationRow = Awaited<ReturnType<typeof getConversations>>[number];

export async function getConversation(businessId: string, id: string) {
  const c = await prisma.conversation.findFirst({
    where: { id, businessId },
    include: {
      channel: { select: { type: true } },
      lead: { select: { id: true } },
      orders: { select: { id: true }, take: 1 },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });
  if (!c) return null;

  const name = c.customerName?.trim() || "—";
  return {
    id: c.id,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    channelType: c.channel?.type ?? null,
    status: c.status,
    aiEnabled: c.aiEnabled,
    hasLead: Boolean(c.lead),
    hasOrder: c.orders.length > 0,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      stoppedReason: m.stoppedReason,
    })),
  };
}

export type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversation>>>;

export async function getAccount(userId: string, businessId: string) {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.subscription.findUnique({
      where: { businessId },
      select: { plan: { select: { name: true } } },
    }),
  ]);

  const name = user?.name?.trim() || user?.email?.split("@")[0] || "—";
  return {
    name,
    email: user?.email ?? "",
    initial: name.charAt(0).toUpperCase(),
    planName: subscription?.plan.name ?? null,
  };
}

export type Account = Awaited<ReturnType<typeof getAccount>>;

export async function getProfile(userId: string, businessId: string) {
  const [user, business] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { user, business };
}
