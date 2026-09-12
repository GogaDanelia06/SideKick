"use server";

import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidateBusinesses } from "@/lib/admin/revalidate";
import { log } from "@/lib/logger";
import { fail, type AdminResult } from "./shared";

/** Platform admin only: assigns a plan by hand, creating the subscription if missing. */
export async function setBusinessPlan(
  businessId: string,
  planId: string,
  status: SubscriptionStatus,
  resetUsage: boolean,
): Promise<AdminResult> {
  const admin = await requireAdmin();

  const [business, plan] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { id: true } }),
    prisma.plan.findUnique({ where: { id: planId }, select: { key: true } }),
  ]);
  if (!business) return fail("ბიზნესი ვერ მოიძებნა");
  if (!plan) return fail("გეგმა ვერ მოიძებნა");

  await prisma.subscription.upsert({
    where: { businessId },
    update: { planId, status, ...(resetUsage ? { msgUsed: 0 } : {}) },
    create: { businessId, planId, status, msgUsed: 0 },
  });

  log.info("admin set a business plan", { userId: admin.userId, businessId, plan: plan.key, status, resetUsage });
  revalidateBusinesses();
  return { ok: true };
}
