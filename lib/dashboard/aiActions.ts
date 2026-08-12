"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { buildPrompt, editPrompt, releaseToBot, aiConfigured } from "@/lib/ai/client";
import { DASH } from "@/lib/dashboard/routes";

export type PromptResult =
  | { ok: true; prompt: string }
  | { ok: false; error: "forbidden" | "unconfigured" | "failed" | "empty" };

/**
 * Writes a system prompt from what the business has already filled in.
 *
 * Their service generates it and hands it straight back without storing
 * anything, so keeping it is our job — the text goes into `AiConfig.prompt`,
 * the same field the merchant can then edit by hand.
 */
export async function generateAiPrompt(): Promise<PromptResult> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  if (!aiConfigured()) return { ok: false, error: "unconfigured" };

  const prompt = await buildPrompt(ctx.businessId);
  if (!prompt) return { ok: false, error: "failed" };

  return save(ctx.businessId, prompt);
}

/** Rewrites the prompt according to an instruction the merchant typed. */
export async function refineAiPrompt(instructions: string): Promise<PromptResult> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  if (!aiConfigured()) return { ok: false, error: "unconfigured" };

  const clean = instructions.trim();
  if (!clean) return { ok: false, error: "empty" };

  const prompt = await editPrompt(ctx.businessId, clean);
  if (!prompt) return { ok: false, error: "failed" };

  return save(ctx.businessId, prompt);
}

async function save(businessId: string, prompt: string): Promise<PromptResult> {
  await prisma.aiConfig.upsert({
    where: { businessId },
    create: { businessId, prompt, languages: [], roles: [] },
    update: { prompt },
  });
  revalidatePath(DASH.ai);
  return { ok: true, prompt };
}

/**
 * Gives a paused conversation back to the bot.
 *
 * Two halves that must both happen: their side is told to resume, and the pause
 * that lights the "waiting for a human" mark is lifted here. Clearing ours
 * without telling them would leave the bot believing a person is still on it.
 */
export async function handBackToAi(conversationId: string): Promise<{ ok: boolean }> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false };

  // Scoped by business as well as id, so an id from elsewhere cannot reach
  // another tenant's conversation.
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!conversation) return { ok: false };

  const released = await releaseToBot(ctx.businessId, conversationId);
  if (!released) return { ok: false };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { botPausedUntil: null, aiEnabled: true },
  });

  revalidatePath(DASH.conversations);
  return { ok: true };
}
