import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";

/**
 * What the AI service is told when a customer writes in.
 *
 * Deliberately thin. It carries the ids needed to fetch the rest through
 * `/api/agent/*` and nothing else of substance, so the message body is not
 * duplicated into a second system's logs and the two sides cannot drift into
 * disagreeing about what was said. `/api/agent/context` is the source of truth.
 */
export type AgentNotice = {
  event: "message.received";
  businessId: string;
  conversationId: string;
  messageId: string;
  channel: ChannelType;
};

/** Long enough for a cold start on their side, short enough not to pile up. */
const TIMEOUT_MS = 10_000;

export function agentNotifyConfigured() {
  return Boolean(process.env.AI_SERVICE_WEBHOOK_URL && process.env.AI_SERVICE_WEBHOOK_TOKEN);
}

/**
 * Tells the AI service there is something to answer.
 *
 * Never awaited by the request that triggers it. Meta gives the webhook five
 * seconds before it assumes failure and re-sends, and an LLM does not answer in
 * five seconds — blocking on this would turn every conversation into duplicate
 * deliveries.
 *
 * A failure here is logged and dropped rather than retried. The message is
 * already committed on our side, so nothing is lost; if their service was down
 * it can catch up by reading the conversation, which it can already do. Retry
 * logic in this process would be a queue with none of the guarantees of one.
 */
export async function notifyAgent(notice: AgentNotice): Promise<void> {
  const url = process.env.AI_SERVICE_WEBHOOK_URL;
  const token = process.env.AI_SERVICE_WEBHOOK_TOKEN;

  if (!url || !token) {
    // Expected until the AI team supplies an endpoint. Logged at info so a
    // half-finished setup is visible without looking like a fault.
    log.info("agent notify skipped — AI_SERVICE_WEBHOOK_URL/TOKEN not set", {
      conversationId: notice.conversationId,
    });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notice),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI service refused the notice (${res.status}): ${detail.slice(0, 300)}`);
    }

    log.info("agent notified", { conversationId: notice.conversationId });
  } catch (err) {
    log.error("agent notify failed", err, {
      conversationId: notice.conversationId,
      messageId: notice.messageId,
    });
  } finally {
    clearTimeout(timer);
  }
}
