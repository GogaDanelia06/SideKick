import { prisma } from "@/lib/db";

/**
 * Platform-wide analytics for the site owner.
 *
 * Deliberately **aggregate only**: counts, sums and distributions. No message
 * text, customer names, phone numbers or addresses are read here, so the
 * platform owner can see how the business is doing without gaining access to
 * their customers' customers' personal data.
 *
 * That is a decision, not an oversight — widening this to per-conversation
 * content makes the platform owner a processor of every tenant's personal data
 * and needs a contract change first. See docs/HANDOVER.md.
 */

export type PlatformStats = {
  businesses: { total: number; newThisMonth: number };
  users: number;
  conversations: { total: number; active: number };
  messages: { total: number; byAi: number; aiSharePct: number };
  orders: { total: number; revenue: number };
  leads: { total: number; converted: number };
  channelsConnected: number;
  products: number;
  plans: { name: string; key: string; price: number; subscribers: number }[];
  /** New businesses per month, oldest first — a simple growth line. */
  growth: { month: string; count: number }[];
};

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const monthStart = startOfMonth(new Date());
  // Six months back, so the growth line has a fixed, comparable window.
  const windowStart = new Date(monthStart);
  windowStart.setUTCMonth(windowStart.getUTCMonth() - 5);

  const [
    businesses,
    newThisMonth,
    users,
    conversations,
    activeConversations,
    messages,
    aiMessages,
    orderAgg,
    leads,
    convertedLeads,
    channelsConnected,
    products,
    planRows,
    recentBusinesses,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: "ACTIVE" } }),
    prisma.message.count(),
    prisma.message.count({ where: { sender: "AI" } }),
    // Cancelled orders don't count as revenue.
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CLOSED" } }),
    prisma.channel.count({ where: { connected: true } }),
    prisma.product.count(),
    prisma.plan.findMany({
      orderBy: { price: "asc" },
      select: { key: true, name: true, price: true, _count: { select: { subscriptions: true } } },
    }),
    prisma.business.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
  ]);

  // Bucket by month in JS rather than raw SQL — the row count here is small and
  // it keeps the query portable.
  const buckets = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(windowStart);
    d.setUTCMonth(d.getUTCMonth() + i);
    buckets.set(d.toISOString().slice(0, 7), 0);
  }
  for (const b of recentBusinesses) {
    const key = b.createdAt.toISOString().slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return {
    businesses: { total: businesses, newThisMonth },
    users,
    conversations: { total: conversations, active: activeConversations },
    messages: {
      total: messages,
      byAi: aiMessages,
      aiSharePct: messages > 0 ? Math.round((aiMessages / messages) * 100) : 0,
    },
    orders: { total: orderAgg._count, revenue: orderAgg._sum.total ?? 0 },
    leads: { total: leads, converted: convertedLeads },
    channelsConnected,
    products,
    plans: planRows.map((p) => ({
      key: p.key,
      name: p.name,
      price: p.price,
      subscribers: p._count.subscriptions,
    })),
    growth: [...buckets.entries()].map(([month, count]) => ({ month, count })),
  };
}
