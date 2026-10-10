import type { Prisma } from "@prisma/client";
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

export const CHANNEL_FIELDS = {
  id: true,
  type: true,
  status: true,
  connected: true,
  lastSyncAt: true,
} as const;

export type ChannelSummary = Prisma.ChannelGetPayload<{ select: typeof CHANNEL_FIELDS }> & {
  linked: boolean;
};

export async function getChannels(businessId: string): Promise<ChannelSummary[]> {
  const rows = await prisma.channel.findMany({
    where: { businessId },
    select: { ...CHANNEL_FIELDS, externalId: true, accessToken: true },
    orderBy: { type: "asc" },
  });

  return rows.map(({ externalId, accessToken, ...rest }) => ({
    ...rest,
    linked: Boolean(externalId && accessToken),
  }));
}

const TEAM_USER_FIELDS = { id: true, name: true, email: true } as const;

export type TeamMember = Prisma.MembershipGetPayload<{
  include: { user: { select: typeof TEAM_USER_FIELDS } };
}>;

export function getTeam(businessId: string): Promise<TeamMember[]> {
  return prisma.membership.findMany({
    where: { businessId },
    include: { user: { select: TEAM_USER_FIELDS } },
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
