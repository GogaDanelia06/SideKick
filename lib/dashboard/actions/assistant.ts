"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { aiConfigured, askAi, buildPrompt, editPrompt } from "@/lib/ai/client";
import { ensurePrompt } from "@/lib/ai/ensurePrompt";
import { applyReplyStyle } from "@/lib/ai/replyStyle";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";

export type PromptResult =
  | { ok: true; prompt: string }
  | { ok: false; error: "forbidden" | "unconfigured" | "failed" | "empty" };

export type TestReply =
  | { ok: true; reply: string; handoff: boolean; promptDrafted?: boolean }
  | { ok: false; error: "forbidden" | "unconfigured" | "empty" | "failed" | "emoji_only" };

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

/** The tester names its chat; the AI service keeps that history under a thread of this business. */
const TESTER_THREAD = /^[a-z0-9]{8,64}$/;

/** A test question for the assistant. Nothing is stored here; the chat lives in the browser. */
export async function testAiReply(message: string, thread: string): Promise<TestReply> {
  const access = await assistantAccess();
  if ("error" in access) return { ok: false, error: access.error };

  const text = message.trim();
  if (!text) return { ok: false, error: "empty" };
  if (!TESTER_THREAD.test(thread)) return { ok: false, error: "failed" };

  try {
    // The AI service refuses a business that has no saved prompt, which is every new business.
    const drafted = await ensurePrompt(access.businessId);
    // Why it failed — the status, the wait — is in the server log (lib/ai/client.ts), not for the screen.
    const answer = await askAi(access.businessId, `tester-${access.businessId}-${thread}`, text);
    if (!answer) return { ok: false, error: "failed" };

    const reply = await applyReplyStyle(access.businessId, answer.reply);
    // This business chose no emoji, and the whole answer was emoji.
    if (!reply) return { ok: false, error: "emoji_only" };
    // The prompt box on the AI page must show what was just saved for it.
    if (drafted) revalidatePath(DASH.ai);
    return { ok: true, reply, handoff: answer.handoffRequested, ...(drafted ? { promptDrafted: true } : {}) };
  } catch (err) {
    log.error("the AI tester failed on our side", err, { businessId: access.businessId });
    return { ok: false, error: "failed" };
  }
}
