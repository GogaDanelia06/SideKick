import { prisma } from "@/lib/db";
import { isExpired } from "./subscriptionState";

/** Plan caps; `-1` means unlimited. */

export type LimitName = "messages" | "channels" | "users" | "products";

/** `stoppedReason` values caused by billing rather than by an AI failure. */
export const BILLING_STOPS: ReadonlySet<string> = new Set([
  "limit_reached",
  "subscription_expired",
]);

export type LimitVerdict =
  | { allowed: true }
  | {
      allowed: false;
      /** `limit`: upgrade the plan. `expired`: renew it. */
      reason: "limit" | "expired";
      limit: number;
      used: number;
      planName: string;
    };

function unlimited(cap: number): boolean {
  return cap < 0;
}

type PlanCaps = {
  planName: string;
  /** End of the paid period, or null for a trial that never had one. */
  renewsAt: Date | null;
  msgLimit: number;
  channelCap: number;
  userCap: number;
  productCap: number;
  msgUsed: number;
};

async function capsFor(businessId: string): Promise<PlanCaps | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { businessId },
    select: {
      msgUsed: true,
      renewsAt: true,
      plan: {
        select: {
          name: true,
          msgLimit: true,
          channelCap: true,
          userCap: true,
          productCap: true,
        },
      },
    },
  });
  if (!subscription) return null;

  return {
    planName: subscription.plan.name,
    renewsAt: subscription.renewsAt,
    msgLimit: subscription.plan.msgLimit,
    channelCap: subscription.plan.channelCap,
    userCap: subscription.plan.userCap,
    productCap: subscription.plan.productCap,
    msgUsed: subscription.msgUsed,
  };
}

/** Whether one more item is allowed. A business without a subscription row is not blocked. */
export async function checkLimit(
  businessId: string,
  what: LimitName,
): Promise<LimitVerdict> {
  const caps = await capsFor(businessId);
  if (!caps) return { allowed: true };

  const deny = (limit: number, used: number): LimitVerdict =>
    unlimited(limit) || used < limit
      ? { allowed: true }
      : { allowed: false, reason: "limit", limit, used, planName: caps.planName };

  switch (what) {
    case "messages":
      // Expiry only stops AI replies; the dashboard and history stay available.
      if (isExpired(caps.renewsAt)) {
        return {
          allowed: false,
          reason: "expired",
          limit: caps.msgLimit,
          used: caps.msgUsed,
          planName: caps.planName,
        };
      }
      return deny(caps.msgLimit, caps.msgUsed);

    case "channels": {
      const used = await prisma.channel.count({ where: { businessId, connected: true } });
      return deny(caps.channelCap, used);
    }

    case "users": {
      const used = await prisma.membership.count({ where: { businessId } });
      return deny(caps.userCap, used);
    }

    case "products": {
      const used = await prisma.product.count({ where: { businessId } });
      return deny(caps.productCap, used);
    }
  }
}

/** Counts one delivered AI message against the monthly allowance. */
export async function countMessage(businessId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { businessId },
    data: { msgUsed: { increment: 1 } },
  });
}
