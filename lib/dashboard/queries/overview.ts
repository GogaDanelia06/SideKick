import { prisma } from "@/lib/db";
import { planLabel } from "@/lib/content/packages";
import { CHANNEL_FIELDS } from "./records";

export function metric(current: number, previous: number) {
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
    prisma.channel.findMany({
      where: { businessId },
      select: CHANNEL_FIELDS,
      orderBy: { type: "asc" },
    }),
    prisma.message.findMany({
      where: { stoppedReason: { not: null }, conversation: { businessId } },
      select: {
        id: true,
        text: true,
        stoppedReason: true,
        createdAt: true,
        conversation: {
          select: { customerName: true, channel: { select: { type: true } } },
        },
      },
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
      planName: planLabel(subscription.plan),
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
