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
  } catch {
    return { ok: true, created: false };
  }

  revalidatePath(DASH.leads);
  revalidatePath(DASH.conversations);
  return { ok: true, created: true };
}
