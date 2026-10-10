import { prisma } from "@/lib/db";
import { countByStatus, signupsByMonth, startOfMonth } from "./helpers";
import type { PlatformStats } from "./types";

export async function getPlatformStats(): Promise<PlatformStats> {
  const monthStart = startOfMonth(new Date());
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
    activeSubs,
    subsByStatus,
    paidThisMonth,
    paidTotal,
    failedThisMonth,
    pendingPayments,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: "ACTIVE" } }),
    prisma.message.count(),
    prisma.message.count({ where: { sender: "AI" } }),
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

    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { plan: { select: { price: true } } },
    }),
    prisma.subscription.groupBy({ by: ["status"], _count: true }),

    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: "FAILED", date: { gte: monthStart } } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);

  return {
    businesses: { total: businesses, newThisMonth },
    users,
    conversations: { total: conversations, active: activeConversations },
    messages: {
      total: messages,
      byAi: aiMessages,
      aiSharePct: messages > 0 ? Math.round((aiMessages / messages) * 100) : 0,
    },
    tenantSales: { orders: orderAgg._count, total: orderAgg._sum.total ?? 0 },
    leads: { total: leads, converted: convertedLeads },
    channelsConnected,
    products,
    income: {
      mrr: activeSubs.reduce((sum, s) => sum + s.plan.price, 0),
      collectedThisMonth: paidThisMonth._sum.amount ?? 0,
      collectedTotal: paidTotal._sum.amount ?? 0,
      failedThisMonth,
      pending: pendingPayments,
    },
    subscriptions: {
      trial: countByStatus(subsByStatus, "TRIAL"),
      active: countByStatus(subsByStatus, "ACTIVE"),
      pastDue: countByStatus(subsByStatus, "PAST_DUE"),
      cancelled: countByStatus(subsByStatus, "CANCELLED"),
    },
    plans: planRows.map((p) => ({
      key: p.key,
      name: p.name,
      price: p.price,
      subscribers: p._count.subscriptions,
    })),
    growth: signupsByMonth(recentBusinesses, windowStart),
  };
}

export type { PlatformStats } from "./types";
