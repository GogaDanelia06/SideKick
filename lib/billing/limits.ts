import { prisma } from "@/lib/db";

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

export type LimitVerdict =
  | { allowed: true }
  | { allowed: false; limit: number; used: number; planName: string };

/** `-1` is how the seed and admin panel express "no ceiling". */
function unlimited(cap: number): boolean {
  return cap < 0;
}

type PlanCaps = {
  planName: string;
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
      : { allowed: false, limit, used, planName: caps.planName };

  switch (what) {
    case "messages":
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
