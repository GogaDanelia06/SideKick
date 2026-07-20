import { prisma } from "@/lib/db";

/** Read helpers for the dashboard sections. Each is scoped by businessId. */

export function getLeads(businessId: string) {
  return prisma.lead.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
}

export function getProducts(businessId: string) {
  return prisma.product.findMany({ where: { businessId }, orderBy: { createdAt: "asc" } });
}

export function getVideos(businessId: string) {
  return prisma.video.findMany({ where: { businessId }, orderBy: { title: "asc" } });
}

export function getChannels(businessId: string) {
  return prisma.channel.findMany({ where: { businessId }, orderBy: { type: "asc" } });
}

export function getTeam(businessId: string) {
  return prisma.membership.findMany({
    where: { businessId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBilling(businessId: string, userId: string) {
  const [subscription, payments, plans, user] = await Promise.all([
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.payment.findMany({ where: { businessId }, orderBy: { date: "desc" } }),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);
  return { subscription, payments, plans, cardName: user?.name ?? "" };
}

export async function getAiConfig(businessId: string) {
  const [config, faqs] = await Promise.all([
    prisma.aiConfig.findUnique({ where: { businessId } }),
    prisma.faq.findMany({ where: { businessId } }),
  ]);
  return { config, faqs };
}

export async function getProfile(userId: string, businessId: string) {
  const [user, business] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { user, business };
}
