import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";

/** Ids only: the AI service reads message content through /api/agent/*. */
export type AgentNotice = {
  event: "message.received";
  businessId: string;
  conversationId: string;
  messageId: string;
  channel: ChannelType;
};

const TIMEOUT_MS = 10_000;

export function agentNotifyConfigured() {
  return Boolean(process.env.AI_SERVICE_WEBHOOK_URL && process.env.AI_SERVICE_WEBHOOK_TOKEN);
}

/** Notifies the AI service of a new message. Failures are logged, never retried. */
export async function notifyAgent(notice: AgentNotice): Promise<void> {
  const url = process.env.AI_SERVICE_WEBHOOK_URL;
  const token = process.env.AI_SERVICE_WEBHOOK_TOKEN;

  if (!url || !token) {
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
