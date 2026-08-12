import { log } from "@/lib/logger";

/**
 * Talks to the AI service that answers customers.
 *
 * The shape here is theirs, not ours, and it is worth naming the difference:
 * this is a **request/response** API, not a webhook. We hand it one message and
 * it hands back the reply in the same call. Nothing arrives later, nothing is
 * pushed to us — so whatever it returns is the answer, and if the call fails
 * there is no reply coming at all.
 *
 * Their ids are snake_case and ours are camelCase. The translation happens here
 * so exactly one file knows about it.
 */

/** Their base URL. The paths below are appended to it. */
const base = () => process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

/** Bearer, as their developer specified when handing over the key. */
const key = () => process.env.AI_SERVICE_KEY;

/**
 * Generous, because the thing on the other end is a language model.
 *
 * Safe to be generous only because every call sits outside Meta's five second
 * window — in `after()`, or behind a dashboard button. Putting one of these in
 * the webhook request itself would guarantee a retry.
 */
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
      // Their endpoints take no body in some cases, but always accept JSON.
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, detail: `HTTP ${res.status}: ${detail.slice(0, 300)}` };
    }

    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    // A timeout lands here too. Never thrown onward: every caller has something
    // better to do than crash, and the customer's message is already stored.
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

/**
 * Asks the AI to answer one customer message.
 *
 * `conversationId` is ours, passed through unchanged: their side keeps the
 * history against it, which is why only the newest message is sent rather than
 * the whole thread.
 */
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
    // A blank reply is worse than none: stored, it shows the customer an empty
    // bubble from the business.
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
