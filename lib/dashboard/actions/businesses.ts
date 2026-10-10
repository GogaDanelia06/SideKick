"use server";

import { unstable_update } from "@/auth";
import { prisma } from "@/lib/db";
import { BUSINESS_NAME_MAX, MAX_OWNED_BUSINESSES, cleanBusinessName } from "@/lib/dashboard/businesses";
import { log } from "@/lib/logger";
import { provisionBusiness } from "@/lib/provision";
import { getContext } from "@/lib/session";

export type AddBusinessError = "unauthorized" | "name" | "taken" | "limit" | "failed";
export type AddBusinessResult = { ok: true } | { ok: false; error: AddBusinessError };

async function openBusiness(businessId: string): Promise<boolean> {
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

export async function addBusiness(name: string): Promise<AddBusinessResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };

  const clean = typeof name === "string" ? cleanBusinessName(name) : "";
  if (!clean || clean.length > BUSINESS_NAME_MAX) return { ok: false, error: "name" };

  try {
    const business = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ctx.userId}))`;
      const [owned, sameName] = await Promise.all([
        tx.membership.count({ where: { userId: ctx.userId, role: "OWNER" } }),
        tx.membership.findFirst({
          where: { userId: ctx.userId, business: { name: { equals: clean, mode: "insensitive" } } },
          select: { id: true },
        }),
      ]);
      if (owned >= MAX_OWNED_BUSINESSES) return "limit" as const;
      if (sameName) return "taken" as const;
      return provisionBusiness(ctx.userId, clean, undefined, tx);
    });
    if (typeof business === "string") return { ok: false, error: business };

    log.info("business added", { userId: ctx.userId, businessId: business.id });
    await openBusiness(business.id).catch((err) =>
      log.error("could not open the new business", err, { userId: ctx.userId, businessId: business.id }),
    );
    return { ok: true };
  } catch (err) {
    log.error("could not add a business", err, { userId: ctx.userId });
    return { ok: false, error: "failed" };
  }
}
