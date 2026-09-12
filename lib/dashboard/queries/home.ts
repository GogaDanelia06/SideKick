import { prisma } from "@/lib/db";
import { CHANNEL_FIELDS } from "./channels";
import { COUNTED_ORDER, metric, minutesSince } from "./metrics";

const STOPPED_LIMIT = 5;

function dayRanges(now: Date) {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  return { today: { gte: startToday }, yesterday: { gte: startYesterday, lt: startToday } };
}

export async function getHomeOverview(businessId: string) {
  const now = new Date();
  const { today, yesterday } = dayRanges(now);
  const revenue = (createdAt: typeof today | typeof yesterday) =>
    prisma.order.aggregate({ _sum: { total: true }, where: { businessId, createdAt, status: COUNTED_ORDER } });

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
    revenue(today),
    revenue(yesterday),
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.channel.findMany({ where: { businessId }, select: CHANNEL_FIELDS, orderBy: { type: "asc" } }),
    prisma.message.findMany({
      where: { stoppedReason: { not: null }, conversation: { businessId } },
      select: {
        id: true,
        text: true,
        stoppedReason: true,
        createdAt: true,
        conversation: { select: { customerName: true, channel: { select: { type: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: STOPPED_LIMIT,
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
      minutesAgo: minutesSince(m.createdAt, now.getTime()),
    })),
  };
}

export type HomeOverview = Awaited<ReturnType<typeof getHomeOverview>>;
