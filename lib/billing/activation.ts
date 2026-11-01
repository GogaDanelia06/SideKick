import type { SubscriptionStatus } from "@prisma/client";

type SubscriptionState = { status: SubscriptionStatus; renewsAt?: Date | string | null };

export function isActivated(subscription: SubscriptionState | null | undefined, now = new Date()): boolean {
  if (!subscription || subscription.status === "PENDING") return false;
  if (subscription.status !== "CANCELLED") return true;
  const paidUntil = subscription.renewsAt ? new Date(subscription.renewsAt).getTime() : 0;
  return paidUntil > now.getTime();
}
