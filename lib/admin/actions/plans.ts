"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parsePlan } from "@/lib/admin/forms/plan";
import { revalidatePlans } from "@/lib/admin/revalidate";
import { fail, type AdminResult } from "./shared";

export async function updatePlan(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parsePlan(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.plan.update({ where: { id }, data: parsed.data });
  revalidatePlans();
  return { ok: true };
}
