"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { can, requirePermission } from "@/lib/auth/permissions";
import { availableProviders, parseProvider } from "@/lib/payments";
import { isAllowedMonths, startCheckout } from "@/lib/billing/checkout";
import { log } from "@/lib/logger";
import { DASH } from "../routes";
import type { ActionResult } from "./result";

export type CheckoutStart = { ok: true; redirectUrl: string } | { ok: false; error: string };

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
    const started = await startCheckout({
      businessId: ctx.businessId,
      plan,
      months,
      provider: chosen,
      locale,
    });
    revalidatePath(DASH.billing);
    return { ok: true, redirectUrl: started.redirectUrl };
  } catch (err) {
    log.error("could not start plan checkout", err, { businessId: ctx.businessId, planKey });
    return { ok: false, error: "checkout_failed" };
  }
}

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

export type PlanSwitchResult = { ok: true } | { ok: false; error: string };

export async function switchPlanWithoutPayment(planKey: string): Promise<PlanSwitchResult> {
  const ctx = await requirePermission("billing:manage");
  if (!ctx) return { ok: false, error: "forbidden" };

  if (availableProviders().length > 0) {
    return { ok: false, error: "payments_enabled" };
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey }, select: { id: true } });
  if (!plan) return { ok: false, error: "unknown_plan" };

  await prisma.subscription.upsert({
    where: { businessId: ctx.businessId },
    update: { planId: plan.id, status: "TRIAL", msgUsed: 0 },
    create: { businessId: ctx.businessId, planId: plan.id, status: "TRIAL", msgUsed: 0 },
  });

  log.info("plan switched with no payment configured", {
    businessId: ctx.businessId,
    plan: planKey,
  });

  revalidatePath(DASH.billing);
  return { ok: true };
}
