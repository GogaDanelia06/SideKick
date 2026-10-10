import { log } from "@/lib/logger";
import { call, PROMPT_TIMEOUT_MS, type AiFailure } from "./call";

export { aiConfigured } from "./call";

/** Client for the AI service: synchronous request/response, snake_case translated here. */

export type AiReply = {
  reply: string;
  /** The AI has decided this needs a person. */
  handoffRequested: boolean;
  handoffReason: string | null;
};

/** Asks for a reply to one message and says why when there is none; the service keeps history per `conversationId`. */
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

/** The same, for callers that only need to know whether there is an answer. */
export async function askAi(
  businessId: string,
  conversationId: string,
  message: string,
): Promise<AiReply | null> {
  const answer = await askAiDetailed(businessId, conversationId, message);
  return answer.ok ? answer.reply : null;
}

/** Generates a system prompt from what the business has already told us. */
export async function buildPrompt(businessId: string): Promise<string | null> {
  const res = await call<{ system_prompt?: string }>(
    `/businesses/${encodeURIComponent(businessId)}/build-prompt`,
    undefined,
    PROMPT_TIMEOUT_MS,
  );
  if (!res.ok) {
    const { kind, status, waitedMs, detail } = res;
    log.error("AI service could not build a prompt", undefined, { businessId, kind, status, waitedMs, detail });
    return null;
  }
  return res.data.system_prompt?.trim() || null;
}

/** Rewrites the prompt according to an instruction the merchant typed. */
export async function editPrompt(
  businessId: string,
  instructions: string,
): Promise<string | null> {
  const res = await call<{ system_prompt?: string }>(
    `/businesses/${encodeURIComponent(businessId)}/edit-prompt`,
    { edit_instructions: instructions },
    PROMPT_TIMEOUT_MS,
  );
  if (!res.ok) {
    const { kind, status, waitedMs, detail } = res;
    log.error("AI service could not edit the prompt", undefined, { businessId, kind, status, waitedMs, detail });
    return null;
  }
  return res.data.system_prompt?.trim() || null;
}

/** Hands a conversation back to the bot after a person has stepped in. */
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
