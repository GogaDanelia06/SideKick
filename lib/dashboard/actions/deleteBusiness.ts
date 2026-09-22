"use server";

import { unstable_update } from "@/auth";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { getContext } from "@/lib/session";

export type DeleteBusinessError = "unauthorized" | "forbidden" | "confirm" | "last" | "members" | "paid" | "failed";
export type DeleteBusinessResult = { ok: true } | { ok: false; error: DeleteBusinessError };

/** A bank checkout takes minutes; a pending payment older than this was abandoned. */
const CHECKOUT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes a business and everything in it: every table cascades from Business. Only
 * its owner can, after typing its name, and only when nothing goes with it that is
 * not theirs alone: no teammate works in it, and no payment record (which the
 * accounts must keep) or payment still at the bank would be lost.
 */
export async function deleteBusiness(businessId: string, confirmName: string): Promise<DeleteBusinessResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (typeof businessId !== "string" || typeof confirmName !== "string") return { ok: false, error: "confirm" };

  try {
    const [membership, another, teammates, payments] = await Promise.all([
      prisma.membership.findUnique({
        where: { userId_businessId: { userId: ctx.userId, businessId } },
        select: { role: true, business: { select: { name: true } } },
      }),
      // Oldest first, like sign-in: where the session goes if this was the open one.
      prisma.membership.findFirst({
        where: { userId: ctx.userId, businessId: { not: businessId } },
        orderBy: { createdAt: "asc" },
        select: { businessId: true },
      }),
      prisma.membership.count({ where: { businessId, userId: { not: ctx.userId } } }),
      prisma.payment.count({
        where: {
          businessId,
          OR: [{ status: "PAID" }, { status: "PENDING", date: { gte: new Date(Date.now() - CHECKOUT_WINDOW_MS) } }],
        },
      }),
    ]);

    if (membership?.role !== "OWNER") return { ok: false, error: "forbidden" };
    if (confirmName.trim() !== membership.business.name.trim()) return { ok: false, error: "confirm" };
    // Without any business the dashboard has nothing to open.
    if (!another) return { ok: false, error: "last" };
    if (teammates > 0) return { ok: false, error: "members" };
    if (payments > 0) return { ok: false, error: "paid" };

    await prisma.business.delete({ where: { id: businessId } });
    log.info("business deleted by its owner", { userId: ctx.userId, businessId });

    if (ctx.businessId === businessId) {
      // Should this fail, the next request finds no membership and sends them to log in again.
      await unstable_update({ user: { businessId: another.businessId } }).catch((err) =>
        log.error("could not open another business after a delete", err, { userId: ctx.userId }),
      );
    }
    return { ok: true };
  } catch (err) {
    log.error("could not delete a business", err, { userId: ctx.userId, businessId });
    return { ok: false, error: "failed" };
  }
}
