"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { askAi, buildPrompt, editPrompt, releaseToBot, aiConfigured } from "@/lib/ai/client";
import { DASH } from "@/lib/dashboard/routes";

export type PromptResult =
  | { ok: true; prompt: string }
  | { ok: false; error: "forbidden" | "unconfigured" | "failed" | "empty" };

/** Generates a system prompt from the business profile and saves it to `AiConfig.prompt`. */
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

/** Hands a paused conversation back to the bot, both on the AI service and here. */
export async function handBackToAi(conversationId: string): Promise<{ ok: boolean }> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false };

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

export type TestReply =
  | { ok: true; reply: string; handoff: boolean }
  | { ok: false; error: "forbidden" | "unconfigured" | "empty" | "failed" };

/** A test question for the assistant; nothing is stored. Uses a fixed per-business thread id. */
export async function testAiReply(message: string): Promise<TestReply> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  if (!aiConfigured()) return { ok: false, error: "unconfigured" };

  const text = message.trim();
  if (!text) return { ok: false, error: "empty" };

  const answer = await askAi(ctx.businessId, `tester-${ctx.businessId}`, text);
  if (!answer) return { ok: false, error: "failed" };

  return { ok: true, reply: answer.reply, handoff: answer.handoffRequested };
}
