import type { ChannelType } from "@prisma/client";
import { GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

const TIMEOUT_MS = 10_000;

const WINDOW_CLOSED_CODE = 1545041;

export type DeliveryStatus = "SENT" | "WINDOW_CLOSED" | "FAILED";

export type DeliveryResult = {
  status: DeliveryStatus;
  externalId?: string;
  detail?: string;
};

type GraphError = { message?: string; code?: number };

function route(channelType: ChannelType, accountId: string, accessToken: string) {
  const host = graphHostFor(channelType, accessToken);
  const addressedByAccountId = host === GRAPH_INSTAGRAM || channelType !== "INSTAGRAM";
  return { host, path: addressedByAccountId ? accountId : "me" };
}

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
