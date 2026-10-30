import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export function isActivated(subscription: { status: SubscriptionStatus } | null | undefined): boolean {
  return Boolean(subscription) && subscription?.status !== "PENDING";
}

export async function businessActivated(businessId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({ where: { businessId }, select: { status: true } });
  return isActivated(subscription);
}
