import { prisma } from "@/lib/db";

export async function getBilling(businessId: string, userId: string) {
  const [subscription, payments, user, plans] = await Promise.all([
    prisma.subscription.findUnique({ where: { businessId }, include: { plan: true } }),
    prisma.payment.findMany({ where: { businessId }, orderBy: { date: "desc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
  ]);
  return { subscription, payments, cardName: user?.name ?? "", plans };
}
