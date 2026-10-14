"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { aiConfigured, editPromptDetailed } from "@/lib/ai/client";
import { correctionInstruction } from "@/lib/ai/correctionInstruction";
import { requirePermission } from "@/lib/auth/permissions";
import { DEFAULT_AI_LANGUAGE } from "@/lib/dashboard/aiLanguages";
import { promptFailure } from "@/lib/dashboard/promptFailure";
import { DASH } from "@/lib/dashboard/routes";
import type { PromptResult } from "./assistant";

export type CorrectionProposal = { ok: true; prompt: string; saved: string } | Extract<PromptResult, { ok: false }>;

export async function proposePromptCorrection(
  conversationId: string,
  messageIds: string[],
  note: string,
): Promise<CorrectionProposal> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  if (!aiConfigured()) return { ok: false, error: "unconfigured" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { messages: { orderBy: { createdAt: "asc" }, take: 200, select: { id: true, sender: true, text: true } } },
  });
  const instruction = conversation ? correctionInstruction(conversation.messages, messageIds, note) : null;
  if (!instruction) return { ok: false, error: "empty" };

  const config = await prisma.aiConfig.findUnique({ where: { businessId: ctx.businessId }, select: { prompt: true } });
  const outcome = await editPromptDetailed(ctx.businessId, instruction);
  if (!outcome.ok) return promptFailure(outcome.failure);

  return { ok: true, prompt: outcome.prompt, saved: config?.prompt ?? "" };
}

export async function applyPromptCorrection(prompt: string): Promise<{ ok: boolean }> {
  const ctx = await requirePermission("ai:write");
  const clean = prompt.trim();
  if (!ctx || !clean) return { ok: false };

  await prisma.aiConfig.upsert({
    where: { businessId: ctx.businessId },
    update: { prompt: clean },
    create: { businessId: ctx.businessId, languages: [DEFAULT_AI_LANGUAGE], prompt: clean },
  });
  revalidatePath(DASH.ai);
  return { ok: true };
}
