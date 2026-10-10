import { log } from "@/lib/logger";
import { call, PROMPT_TIMEOUT_MS, type AiFailure } from "./call";

export { aiConfigured } from "./call";

export type AiReply = {
  reply: string;
  handoffRequested: boolean;
  handoffReason: string | null;
};

export async function askAiDetailed(
  businessId: string,
  conversationId: string,
  message: string,
): Promise<{ ok: true; reply: AiReply } | { ok: false; failure: AiFailure }> {
  const res = await call<{
    reply?: string;
    handoff_requested?: boolean;
    handoff_reason?: string | null;
  }>(`/businesses/${encodeURIComponent(businessId)}/messages`, {
    conversation_id: conversationId,
    message,
  });

  if (!res.ok) {
    const { kind, status, waitedMs, detail } = res;
    log.error("AI service could not answer", undefined, { conversationId, kind, status, waitedMs, detail });
    return { ok: false, failure: res };
  }

  const reply = res.data.reply?.trim();
  if (!reply) {
    log.warn("AI service returned an empty reply", { conversationId });
    return { ok: false, failure: { kind: "empty_reply", waitedMs: 0, detail: "the reply was blank" } };
  }

  return {
    ok: true,
    reply: {
      reply,
      handoffRequested: res.data.handoff_requested === true,
      handoffReason: res.data.handoff_reason?.trim() || null,
    },
  };
}

export async function askAi(
  businessId: string,
  conversationId: string,
  message: string,
): Promise<AiReply | null> {
  const answer = await askAiDetailed(businessId, conversationId, message);
  return answer.ok ? answer.reply : null;
}

async function writePrompt(
  businessId: string,
  endpoint: "build-prompt" | "edit-prompt",
  failed: string,
  body?: unknown,
): Promise<string | null> {
  const started = Date.now();
  const res = await call<{ system_prompt?: string }>(
    `/businesses/${encodeURIComponent(businessId)}/${endpoint}`,
    body,
    PROMPT_TIMEOUT_MS,
  );
  if (!res.ok) {
    const { kind, status, waitedMs, detail } = res;
    log.error(failed, undefined, { businessId, kind, status, waitedMs, detail });
    return null;
  }
  log.info("AI service wrote a prompt", { businessId, call: endpoint, waitedMs: Date.now() - started });
  return res.data.system_prompt?.trim() || null;
}

export function buildPrompt(businessId: string): Promise<string | null> {
  return writePrompt(businessId, "build-prompt", "AI service could not build a prompt");
}

export function editPrompt(businessId: string, instructions: string): Promise<string | null> {
  return writePrompt(businessId, "edit-prompt", "AI service could not edit the prompt", { edit_instructions: instructions });
}

export async function releaseToBot(
  businessId: string,
  conversationId: string,
): Promise<boolean> {
  const res = await call(
    `/businesses/${encodeURIComponent(businessId)}/conversations/${encodeURIComponent(conversationId)}/release`,
  );
  if (!res.ok) {
    log.error("AI service refused to take a conversation back", undefined, {
      conversationId,
      detail: res.detail,
    });
  }
  return res.ok;
}
