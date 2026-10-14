import { log } from "@/lib/logger";
import { call, type AiFailure } from "./call";

export { aiConfigured } from "./call";
export { buildPrompt, buildPromptDetailed, editPrompt, editPromptDetailed, type PromptOutcome } from "./promptCalls";

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
