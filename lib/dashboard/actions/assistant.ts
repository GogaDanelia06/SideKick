"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { aiConfigured, askAi, buildPrompt, editPrompt } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";

export type PromptResult =
  | { ok: true; prompt: string }
  | { ok: false; error: "forbidden" | "unconfigured" | "failed" | "empty" };

export type TestReply =
  | { ok: true; reply: string; handoff: boolean }
  | { ok: false; error: "forbidden" | "unconfigured" | "empty" | "failed" };

/** The business the assistant works for, or why it cannot be used. */
async function assistantAccess(): Promise<{ businessId: string } | { error: "forbidden" | "unconfigured" }> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { error: "forbidden" };
  if (!aiConfigured()) return { error: "unconfigured" };
  return { businessId: ctx.businessId };
}

async function savePrompt(businessId: string, prompt: string | null): Promise<PromptResult> {
  if (!prompt) return { ok: false, error: "failed" };

  await prisma.aiConfig.upsert({
    where: { businessId },
    create: { businessId, prompt, languages: [], roles: [] },
    update: { prompt },
  });
  revalidatePath(DASH.ai);
  return { ok: true, prompt };
}

/** Generates a system prompt from the business profile and saves it to `AiConfig.prompt`. */
export async function generateAiPrompt(): Promise<PromptResult> {
  const access = await assistantAccess();
  if ("error" in access) return { ok: false, error: access.error };

  return savePrompt(access.businessId, await buildPrompt(access.businessId));
}

/** Rewrites the prompt according to an instruction the merchant typed. */
export async function refineAiPrompt(instructions: string): Promise<PromptResult> {
  const access = await assistantAccess();
  if ("error" in access) return { ok: false, error: access.error };

  const clean = instructions.trim();
  if (!clean) return { ok: false, error: "empty" };
  return savePrompt(access.businessId, await editPrompt(access.businessId, clean));
}

/** A test question for the assistant; nothing is stored. Uses a fixed per-business thread id. */
export async function testAiReply(message: string): Promise<TestReply> {
  const access = await assistantAccess();
  if ("error" in access) return { ok: false, error: access.error };

  const text = message.trim();
  if (!text) return { ok: false, error: "empty" };

  const answer = await askAi(access.businessId, `tester-${access.businessId}`, text);
  if (!answer) return { ok: false, error: "failed" };
  return { ok: true, reply: answer.reply, handoff: answer.handoffRequested };
}
