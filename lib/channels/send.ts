import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";

/**
 * Graph API version. Pinned rather than floating: Meta changes response shapes
 * between versions and an unpinned call would start failing on their schedule
 * instead of ours. Bumping it is a deliberate edit, not a surprise.
 */
const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

/** Long enough for a slow Graph response, short enough not to hang the caller. */
const TIMEOUT_MS = 10_000;

/**
 * Meta's code for "the 24 hour window has closed".
 *
 * Worth singling out because it is not a fault. Messenger only lets a business
 * reply within 24 hours of the customer's last message; after that the customer
 * has to write again. Treating it as an error would have someone hunting a bug
 * that is really a policy, so it gets its own status.
 */
const WINDOW_CLOSED_CODE = 1545041;

export type DeliveryStatus = "SENT" | "WINDOW_CLOSED" | "FAILED";

/** Channels the Send API can answer on. */
const SENDABLE = new Set<ChannelType>(["FACEBOOK", "INSTAGRAM"]);

export type DeliveryResult = {
  status: DeliveryStatus;
  /** Meta's id for the sent message, when it went out. */
  externalId?: string;
  /** Human-readable reason, for the log and the API response. */
  detail?: string;
};

type GraphError = { message?: string; code?: number };

/**
 * Which host answers for which channel.
 *
 * Not cosmetic. Instagram here runs on **Instagram Login**, not the Messenger
 * Platform, and the two are separate APIs that happen to share a request shape:
 * a different host, a different kind of token (`IGA…` rather than a Page's
 * `EAA…`), and a different id in the path. Sending an Instagram reply to
 * graph.facebook.com fails with "object does not exist" — confirmed against
 * the live account, not assumed.
 */
const HOSTS: Record<string, string> = {
  FACEBOOK: "https://graph.facebook.com",
  INSTAGRAM: "https://graph.instagram.com",
};

/**
 * Hands one text message to Meta for delivery.
 *
 * The account id is in the path and the token in the query string because that
 * is the shape Meta documents. `messaging_type: "RESPONSE"` declares this as an
 * answer to something the customer said, which is what makes it allowed inside
 * the 24 hour window — omitting it gets the message refused.
 */
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
    const res = await fetch(
      `${HOSTS[channelType] ?? HOSTS.FACEBOOK}/${GRAPH_VERSION}/${pageId}/messages` +
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
    // A timeout lands here too. Reported rather than thrown: the message is
    // already saved, and the caller has something better to do than crash.
    return { status: "FAILED", detail: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sends a message we have already stored out to the customer it was written for.
 *
 * Returns null when there is nothing to deliver to — a conversation started in
 * the dashboard, a channel switched off, a page linked by hand that has no
 * token yet. None of those are errors, and none should colour the reply the AI
 * service gets back; the message is recorded either way.
 */
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
    // Instagram replies go out the same way and on the same Page Access Token —
    // only the id in the path differs, and that is already `externalId`.
    // WhatsApp is not here: it is a different API, not a different id.
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
      // Meta's id for the outbound copy, so an echo of it coming back through
      // the webhook is recognised as one we already have.
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
