import { prisma } from "@/lib/db";
import { isExpired } from "./subscriptionState";

/**
 * What a tenant's plan actually allows.
 *
 * Every cap here was already priced, stored on `Plan`, printed on the pricing
 * page and shown on the tenant's dashboard — but nothing ever checked one, so
 * all three tiers behaved identically. A 49₾ Basic customer had the Premium
 * product. This is the file that makes the difference real.
 *
 * A cap of `-1` means unlimited, which is how the Premium plan is stored.
 */

export type LimitName = "messages" | "channels" | "users" | "products";

/**
 * `Message.stoppedReason` values that mean "we chose not to answer", as opposed
 * to "answering failed".
 *
 * The inbox draws one mark for every non-null `stoppedReason`, and it used to
 * label all of them "AI error". A merchant whose plan had simply run out was
 * told their assistant was broken — which sends them to their developer instead
 * of to the billing page, and makes the product look faulty when it is working
 * exactly as sold.
 */
export const BILLING_STOPS: ReadonlySet<string> = new Set([
  "limit_reached",
  "subscription_expired",
]);

export type LimitVerdict =
  | { allowed: true }
  | {
      allowed: false;
      /**
       * Why, because the two refusals need different words and different fixes.
       * `limit` means buy a bigger plan; `expired` means pay for the one you
       * already chose. Telling a lapsed customer they are "out of messages"
       * sends them to the wrong screen.
       */
      reason: "limit" | "expired";
      limit: number;
      used: number;
      planName: string;
    };

/** `-1` is how the seed and admin panel express "no ceiling". */
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

/**
 * Whether one more of something is allowed.
 *
 * A business with no subscription row is allowed through rather than blocked.
 * Locking someone out of their own account because their billing record is
 * missing turns a data problem into a support call; the caps exist to shape
 * upgrades, not to punish an inconsistency we created.
 */
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
      // Expiry stops the assistant and nothing else. The dashboard, the inbox
      // and the history stay reachable: a merchant whose card failed still owns
      // their customer conversations, and locking them out of their own records
      // punishes the wrong thing. What they lose is the service they stopped
      // paying for.
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

/**
 * Counts one message against the tenant's monthly allowance.
 *
 * `msgUsed` existed on the subscription and was reset to zero at checkout, but
 * nothing ever incremented it — so the usage bar on every dashboard read zero
 * forever. Kept separate from `checkLimit` so a caller decides explicitly when
 * a message has actually been delivered rather than merely attempted.
 */
export async function countMessage(businessId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { businessId },
    data: { msgUsed: { increment: 1 } },
  });
}
