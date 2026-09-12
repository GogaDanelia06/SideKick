import { log } from "@/lib/logger";

/** Client for the AI service: synchronous request/response, snake_case translated here. */

const base = () => process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

const key = () => process.env.AI_SERVICE_KEY;

/** Generous for a language model; these calls never run inside the webhook deadline. */
const TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 45_000);

export function aiConfigured() {
  return Boolean(base() && key());
}

type Result<T> = { ok: true; data: T } | { ok: false; detail: string };

async function call<T>(path: string, body?: unknown): Promise<Result<T>> {
  const url = base();
  const token = key();
  if (!url || !token) {
    return { ok: false, detail: "AI_SERVICE_URL/AI_SERVICE_KEY not set" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${url}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, detail: `HTTP ${res.status}: ${detail.slice(0, 300)}` };
    }

    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export type AiReply = {
  reply: string;
  /** The AI has decided this needs a person. */
  handoffRequested: boolean;
  handoffReason: string | null;
};

/** Asks for a reply to one message; the service keeps history per `conversationId`. */
export async function askAi(
  businessId: string,
  conversationId: string,
  message: string,
): Promise<AiReply | null> {
  const res = await call<{
    reply?: string;
    handoff_requested?: boolean;
    handoff_reason?: string | null;
  }>(`/businesses/${encodeURIComponent(businessId)}/messages`, {
    conversation_id: conversationId,
    message,
  });

  if (!res.ok) {
    log.error("AI service could not answer", undefined, { conversationId, detail: res.detail });
    return null;
  }

  const reply = res.data.reply?.trim();
  if (!reply) {
    log.warn("AI service returned an empty reply", { conversationId });
    return null;
  }

  return {
    reply,
    handoffRequested: res.data.handoff_requested === true,
    handoffReason: res.data.handoff_reason?.trim() || null,
  };
}

/** Generates a system prompt from what the business has already told us. */
export async function buildPrompt(businessId: string): Promise<string | null> {
  const res = await call<{ system_prompt?: string }>(
    `/businesses/${encodeURIComponent(businessId)}/build-prompt`,
  );
  if (!res.ok) {
    log.error("AI service could not build a prompt", undefined, { businessId, detail: res.detail });
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
  );
  if (!res.ok) {
    log.error("AI service could not edit the prompt", undefined, { businessId, detail: res.detail });
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
