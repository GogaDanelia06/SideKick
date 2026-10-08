"use server";

import type { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import { optionalField } from "@/lib/forms";
import type { ActionResult } from "./result";

export async function createLead(fd: FormData): Promise<ActionResult> {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  const name = optionalField(fd, "name");
  if (!name) return { ok: false, error: "name" };

  await prisma.lead.create({
    data: {
      businessId: ctx.businessId,
      name,
      phone: optionalField(fd, "phone"),
      interest: optionalField(fd, "interest"),
      source: optionalField(fd, "source") ?? "manual",
      comment: optionalField(fd, "comment"),
    },
  });
  revalidatePath(DASH.leads);
  return { ok: true };
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await prisma.lead.updateMany({ where: { id, businessId: ctx.businessId }, data: { status } });
  revalidatePath(DASH.leads);
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await prisma.lead.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.leads);
  return { ok: true };
}

