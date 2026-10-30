import type { SubscriptionStatus } from "@prisma/client";

export function isActivated(subscription: { status: SubscriptionStatus } | null | undefined): boolean {
  return Boolean(subscription) && subscription?.status !== "PENDING";
}
