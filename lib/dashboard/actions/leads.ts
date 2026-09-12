"use server";

import type { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isUniqueViolation } from "@/lib/dbErrors";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import { optionalField } from "@/lib/forms";
import type { ActionResult } from "./result";

export async function createLead(fd: FormData) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;
  const name = optionalField(fd, "name");
  if (!name) return;

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
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;

  await prisma.lead.updateMany({ where: { id, businessId: ctx.businessId }, data: { status } });
  revalidatePath(DASH.leads);
}

export async function updateLeadComment(id: string, comment: string) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;

  await prisma.lead.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { comment: comment.trim() || null },
  });
  revalidatePath(DASH.leads);
}

export async function deleteLead(id: string) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;

  await prisma.lead.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.leads);
}

/** Creates a lead from a conversation; the unique `conversationId` prevents duplicates. */
export async function createLeadFromConversation(
  conversationId: string,
): Promise<ActionResult & { created?: boolean }> {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true, customerName: true, channel: { select: { type: true } }, lead: { select: { id: true } } },
  });
  if (!conversation) return { ok: false, error: "not_found" };
  if (conversation.lead) return { ok: true, created: false };

  try {
    await prisma.lead.create({
      data: {
        businessId: ctx.businessId,
        conversationId: conversation.id,
        name: conversation.customerName?.trim() || null,
        source: conversation.channel?.type ?? "manual",
      },
    });
  } catch (err) {
    // A concurrent double click created it first.
    if (isUniqueViolation(err)) return { ok: true, created: false };
    throw err;
  }

  revalidatePath(DASH.leads);
  revalidatePath(DASH.conversations);
  return { ok: true, created: true };
}
