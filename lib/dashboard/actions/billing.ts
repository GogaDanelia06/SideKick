"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth/permissions";
import { isAllowedMonths, startCheckout } from "@/lib/billing/checkout";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { availableProviders, parseProvider } from "@/lib/payments";
import { getContext } from "@/lib/session";
import type { ActionResult } from "./result";

export type CheckoutStart = { ok: true; redirectUrl: string } | { ok: false; error: string };

/** Starts a bank checkout; the plan changes only after the bank confirms payment. */
export async function startPlanCheckout(
  planKey: string,
  months: number,
  provider: string,
  locale: "ka" | "en" = "ka",
): Promise<CheckoutStart> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!can(ctx.role, "billing:manage")) return { ok: false, error: "forbidden" };
  if (!isAllowedMonths(months)) return { ok: false, error: "bad_period" };

  const chosen = parseProvider(provider);
  if (!chosen) return { ok: false, error: "unknown_provider" };
  if (!availableProviders().includes(chosen)) return { ok: false, error: "provider_unavailable" };

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) return { ok: false, error: "unknown_plan" };

  try {
    const { redirectUrl } = await startCheckout({
      businessId: ctx.businessId,
      plan,
      months,
      provider: chosen,
      locale,
    });
    revalidatePath(DASH.billing);
    return { ok: true, redirectUrl };
  } catch (err) {
    log.error("could not start plan checkout", err, { businessId: ctx.businessId, planKey });
    return { ok: false, error: "checkout_failed" };
  }
}

/** Stops renewal; the paid period runs until `renewsAt`. */
export async function cancelSubscription(): Promise<ActionResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!can(ctx.role, "billing:manage")) return { ok: false, error: "forbidden" };

  const updated = await prisma.subscription.updateMany({
    where: { businessId: ctx.businessId },
    data: { status: "CANCELLED", cardRef: null },
  });
  if (updated.count === 0) return { ok: false, error: "no_subscription" };

  revalidatePath(DASH.billing);
  return { ok: true };
}

/**
 * Switches plans without payment, only while no bank provider is configured.
 * The subscription becomes TRIAL because nothing was paid.
 */
export async function switchPlanWithoutPayment(planKey: string): Promise<ActionResult> {
  const ctx = await requirePermission("billing:manage");
  if (!ctx) return { ok: false, error: "ამის უფლება არ გაქვს" };

  if (availableProviders().length > 0) {
    return { ok: false, error: "გადახდა ჩართულია — გეგმა ბანკის გავლით უნდა შეიცვალოს" };
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey }, select: { id: true } });
  if (!plan) return { ok: false, error: "გეგმა ვერ მოიძებნა" };

  await prisma.subscription.upsert({
    where: { businessId: ctx.businessId },
    // Reset usage, or a business that spent its old allowance would stay blocked.
    update: { planId: plan.id, status: "TRIAL", msgUsed: 0 },
    create: { businessId: ctx.businessId, planId: plan.id, status: "TRIAL", msgUsed: 0 },
  });

  log.info("plan switched with no payment configured", { businessId: ctx.businessId, plan: planKey });
  revalidatePath(DASH.billing);
  return { ok: true };
}
