import { log } from "@/lib/logger";
import { call, PROMPT_TIMEOUT_MS, type AiFailure } from "./call";

export type PromptOutcome = { ok: true; prompt: string } | { ok: false; failure: AiFailure };

async function writePrompt(
  businessId: string,
  endpoint: "build-prompt" | "edit-prompt",
  failed: string,
  body?: unknown,
): Promise<PromptOutcome> {
  const started = Date.now();
  const res = await call<{ system_prompt?: string }>(
    `/businesses/${encodeURIComponent(businessId)}/${endpoint}`,
    body,
    PROMPT_TIMEOUT_MS,
  );
  if (!res.ok) {
    const { kind, status, waitedMs, detail } = res;
    log.error(failed, undefined, { businessId, kind, status, waitedMs, detail });
    return { ok: false, failure: { kind, status, waitedMs, detail } };
  }

  const waitedMs = Date.now() - started;
  const prompt = res.data.system_prompt?.trim();
  if (!prompt) {
    log.warn("AI service returned an empty prompt", { businessId, call: endpoint, waitedMs });
    return { ok: false, failure: { kind: "empty_reply", waitedMs, detail: "system_prompt was blank" } };
  }

  log.info("AI service wrote a prompt", { businessId, call: endpoint, waitedMs });
  return { ok: true, prompt };
}

const promptOrNull = (outcome: PromptOutcome) => (outcome.ok ? outcome.prompt : null);

export function buildPromptDetailed(businessId: string): Promise<PromptOutcome> {
  return writePrompt(businessId, "build-prompt", "AI service could not build a prompt");
}

export function editPromptDetailed(businessId: string, instructions: string): Promise<PromptOutcome> {
  return writePrompt(businessId, "edit-prompt", "AI service could not edit the prompt", {
    edit_instructions: instructions,
  });
}

export async function buildPrompt(businessId: string): Promise<string | null> {
  return promptOrNull(await buildPromptDetailed(businessId));
}

export async function editPrompt(businessId: string, instructions: string): Promise<string | null> {
  return promptOrNull(await editPromptDetailed(businessId, instructions));
}
