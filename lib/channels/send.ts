import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";
import { GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

/** Pinned: Meta changes response shapes between versions. */
const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

const TIMEOUT_MS = 10_000;

/** Meta's error when the 24-hour reply window has closed — a policy, not a fault. */
const WINDOW_CLOSED_CODE = 1545041;

export type DeliveryStatus = "SENT" | "WINDOW_CLOSED" | "FAILED";

const SENDABLE = new Set<ChannelType>(["FACEBOOK", "INSTAGRAM"]);

export type DeliveryResult = {
  status: DeliveryStatus;
  externalId?: string;
  detail?: string;
};

type GraphError = { message?: string; code?: number };

/**
 * Instagram replies follow the token (see graphHost.ts): graph.instagram.com is
 * addressed by account id, graph.facebook.com as `me`.
 */
function route(channelType: ChannelType, accountId: string, accessToken: string) {
  const host = graphHostFor(channelType, accessToken);
  const addressedByAccountId = host === GRAPH_INSTAGRAM || channelType !== "INSTAGRAM";
  return { host, path: addressedByAccountId ? accountId : "me" };
}

/** Sends one text reply. `messaging_type: RESPONSE` is required inside the 24-hour window. */
export async function sendToMessenger(
  pageId: string,
  accessToken: string,
  recipientId: string,
  text: string,
  channelType: ChannelType = "FACEBOOK",
): Promise<DeliveryResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { host, path } = route(channelType, pageId, accessToken);
    const res = await fetch(
      `${host}/${GRAPH_VERSION}/${path}/messages` +
        `?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          messaging_type: "RESPONSE",
          message: { text },
        }),
        signal: controller.signal,
      },
    );

    const body = (await res.json().catch(() => ({}))) as {
      message_id?: string;
      error?: GraphError;
    };

    if (!res.ok || body.error) {
      const error = body.error ?? {};
      if (error.code === WINDOW_CLOSED_CODE) {
        return {
          status: "WINDOW_CLOSED",
          detail: "the customer has not written for 24 hours; Messenger will not accept a reply",
        };
      }
      return {
        status: "FAILED",
        detail: error.message ?? `Meta refused the message (HTTP ${res.status})`,
      };
    }

    return { status: "SENT", externalId: body.message_id };
  } catch (err) {
    return { status: "FAILED", detail: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

/** Delivers a stored reply; null when there is nowhere to deliver it. */
export async function deliverOutbound(
  conversationId: string,
  messageId: string,
  text: string,
): Promise<DeliveryResult | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      customerRef: true,
      channel: {
        select: { type: true, connected: true, externalId: true, accessToken: true },
      },
    },
  });

  const channel = conversation?.channel;
  if (
    !conversation?.customerRef ||
    !channel ||
    !SENDABLE.has(channel.type) ||
    !channel.connected ||
    !channel.externalId ||
    !channel.accessToken
  ) {
    return null;
  }

  const result = await sendToMessenger(
    channel.externalId,
    channel.accessToken,
    conversation.customerRef,
    text,
    channel.type,
  );

  await prisma.message.update({
    where: { id: messageId },
    data: {
      deliveryStatus: result.status,
      // Lets the webhook recognise the echo of this message.
      ...(result.externalId ? { externalId: result.externalId } : {}),
    },
  });

  if (result.status === "FAILED") {
    log.error("messenger delivery failed", undefined, {
      conversationId,
      messageId,
      detail: result.detail,
    });
  } else if (result.status === "WINDOW_CLOSED") {
    log.warn("messenger delivery refused — 24h window closed", { conversationId, messageId });
  }

  return result;
}
