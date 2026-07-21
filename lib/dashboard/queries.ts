import { prisma } from "@/lib/db";

/**
 * Dashboard read layer. Every query is scoped to the caller's `businessId` —
 * that filter is the multi-tenant isolation boundary, so a signed-in user can
 * only ever read their own business's data. `businessId` must come from the
 * session (see getContext), never from user input.
 */

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
  const [subscription, payments, user] = await Promise.all([
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.payment.findMany({ where: { businessId }, orderBy: { date: "desc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);
  // Cardholder name isn't stored — live card management is the PSP module.
  // Until then, show the account holder's name alongside the saved card ref.
  const cardName = user?.name ?? "";
  return { subscription, payments, cardName };
}

export async function getAiConfig(businessId: string) {
  const [config, faqs] = await Promise.all([
    prisma.aiConfig.findUnique({ where: { businessId } }),
    prisma.faq.findMany({ where: { businessId }, orderBy: { question: "asc" } }),
  ]);
  return { config, faqs };
}

// Locale-neutral formatting done on the server, in the business's timezone, so
// the markup can't differ between server and client (no hydration mismatch).
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

/** Percentage change vs. the previous period; null when there's no baseline. */
function metric(current: number, previous: number) {
  const deltaPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
  return { value: current, deltaPct };
}

/** Everything the dashboard overview needs, computed live from the database. */
export async function getHomeOverview(businessId: string) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const today = { gte: startToday };
  const yesterday = { gte: startYesterday, lt: startToday };
  const counted = { not: "CANCELLED" as const }; // cancelled orders don't earn revenue

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

export async function getProfile(userId: string, businessId: string) {
  const [user, business] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { user, business };
}
