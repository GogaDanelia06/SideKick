"use server";

import { unstable_update } from "@/auth";
import { prisma } from "@/lib/db";
import { BUSINESS_NAME_MAX, MAX_OWNED_BUSINESSES } from "@/lib/dashboard/businesses";
import { log } from "@/lib/logger";
import { provisionBusiness } from "@/lib/provision";
import { getContext } from "@/lib/session";

export type AddBusinessError = "unauthorized" | "name" | "limit" | "failed";
export type AddBusinessResult = { ok: true } | { ok: false; error: AddBusinessError };

/** Moves the session into `businessId`, or leaves it where it was. */
async function openBusiness(businessId: string): Promise<boolean> {
  // The jwt callback (lib/auth/token.ts) only moves it into a business this user belongs to.
  const session = await unstable_update({ user: { businessId } });
  return session?.user?.businessId === businessId;
}

export async function switchBusiness(businessId: string): Promise<{ ok: boolean }> {
  if (typeof businessId !== "string" || !businessId) return { ok: false };
  const ctx = await getContext();
  if (!ctx) return { ok: false };

  try {
    return { ok: await openBusiness(businessId) };
  } catch (err) {
    log.error("could not switch business", err, { userId: ctx.userId, businessId });
    return { ok: false };
  }
}

/** Creates a business owned by the caller, with the same defaults as at registration, and opens it. */
export async function addBusiness(name: string): Promise<AddBusinessResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };

  const clean = typeof name === "string" ? name.trim() : "";
  if (!clean || clean.length > BUSINESS_NAME_MAX) return { ok: false, error: "name" };

  try {
    const owned = await prisma.membership.count({ where: { userId: ctx.userId, role: "OWNER" } });
    if (owned >= MAX_OWNED_BUSINESSES) return { ok: false, error: "limit" };

    const business = await provisionBusiness(ctx.userId, clean);
    log.info("business added", { userId: ctx.userId, businessId: business.id });
    // Should opening it fail, the new business is still listed in the switcher.
    await openBusiness(business.id).catch((err) =>
      log.error("could not open the new business", err, { userId: ctx.userId, businessId: business.id }),
    );
    return { ok: true };
  } catch (err) {
    log.error("could not add a business", err, { userId: ctx.userId });
    return { ok: false, error: "failed" };
  }
}
