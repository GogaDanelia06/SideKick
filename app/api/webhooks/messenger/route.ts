import { after } from "next/server";
import { log } from "@/lib/logger";
import { PLATFORMS, parseMessagingEvents, tokensMatch, verifySignature } from "@/lib/channels/meta";
import { recordInbound, type RecordedMessage } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";
import { nameCustomer } from "@/lib/channels/profile";
import { describe, traceDelivery } from "@/lib/channels/webhookDebug";
import { answerAfterQuietWindow } from "@/lib/ai/quietWindow";

export const dynamic = "force-dynamic";

/** Meta re-sends a delivery that is not acknowledged within this time. */
const META_DEADLINE_MS = 5_000;

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Verification handshake: echo `hub.challenge` when the verify token matches. */
export async function GET(request: Request) {
  const expected = process.env.META_VERIFY_TOKEN;
  if (!expected) {
    log.error("messenger webhook called with no META_VERIFY_TOKEN set");
    return text("webhook not configured", 503);
  }

  const params = new URL(request.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) return text("bad request", 400);
  if (!tokensMatch(token, expected)) {
    log.warn("messenger webhook verify token did not match");
    return text("forbidden", 403);
  }

  // Meta compares the body byte for byte, so it must be plain text.
  return text(challenge, 200);
}

/**
 * Receives messages from Meta. Within the 5s deadline it only verifies, stores and
 * acknowledges; naming, notifying and AI replies run after the response. Unknown
 * accounts get 200 (nothing to retry); a storage failure gets 500 so Meta retries.
 */
export async function POST(request: Request) {
  // Instagram Login is a separate Meta app with its own secret.
  const secret = process.env.META_APP_SECRET;
  const instagramSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!secret && !instagramSecret) {
    log.error("messenger webhook called with no META_APP_SECRET set");
    return text("webhook not configured", 503);
  }

  // The signature covers the raw bytes, so read text rather than JSON.
  const raw = await request.text();

  if (process.env.DEBUG_WEBHOOK_BODY === "1") {
    // Before the signature check, so rejected deliveries can be inspected too (text is redacted).
    log.warn("RAW WEBHOOK DELIVERY — debug logging is on", traceDelivery(request, raw));
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(raw, signature, secret, instagramSecret)) {
    log.warn("messenger webhook rejected an unsigned or mis-signed request", {
      hasSignature: Boolean(signature),
      secretsTried: [secret && "meta", instagramSecret && "instagram"].filter(Boolean).join("+"),
      shape: describe(safeParse(raw)),
    });
    return text("bad signature", 403);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    log.warn("messenger webhook body was signed but unparseable");
    return text("ok", 200);
  }

  const messages = parseMessagingEvents(payload);

  if (messages.length === 0) {
    // Echoes and receipts land here too; the logged shape (never content) shows what arrived.
    log.info("webhook delivery carried no readable message", { shape: describe(payload) });
    return text("ok", 200);
  }

  const started = Date.now();
  const recorded: RecordedMessage[] = [];
  let lost = 0;

  for (const message of messages) {
    try {
      const result = await recordInbound(PLATFORMS[message.platform], message);
      // A retry of a stored message must not trigger a second reply.
      if (result?.isNew) recorded.push(result);
    } catch (err) {
      lost += 1;
      log.error("messenger webhook failed to record a message", err, {
        pageId: message.pageId,
        externalId: message.externalId,
      });
    }
  }

  const elapsed = Date.now() - started;
  if (elapsed > META_DEADLINE_MS / 2) {
    log.warn("messenger webhook is approaching Meta's 5s deadline", {
      elapsedMs: elapsed,
      messages: messages.length,
    });
  }

  after(async () => {
    const unnamed = new Set(recorded.filter((r) => r.needsName).map((r) => r.conversationId));

    log.info("naming queue", {
      recorded: recorded.length,
      needName: unnamed.size,
      channels: [...new Set(recorded.map((r) => r.channel))].join(","),
    });

    // Independent jobs, started together so the reply never waits on the others.
    const naming = (async () => {
      for (const conversationId of unnamed) await nameCustomer(conversationId);
    })();

    const notices = (async () => {
      for (const result of recorded) {
        await notifyAgent({
          event: "message.received",
          businessId: result.businessId,
          conversationId: result.conversationId,
          messageId: result.messageId,
          channel: result.channel,
        });
      }
    })();

    // Replies run in parallel: each waits out the quiet window and only the newest
    // message of a conversation answers (lib/ai/quietWindow.ts). allSettled keeps the
    // function alive until every reply has finished.
    const outcomes = await Promise.allSettled([
      naming,
      notices,
      ...recorded.map((result) =>
        answerAfterQuietWindow(result.businessId, result.conversationId, result.messageId),
      ),
    ]);
    for (const outcome of outcomes) {
      if (outcome.status === "rejected") {
        log.error("messenger webhook follow-up failed", outcome.reason);
      }
    }
  });

  // Ask Meta to retry the batch; stored messages are recognised by `mid` and skipped.
  if (lost > 0) return text("could not store every message", 500);

  return text("ok", 200);
}
