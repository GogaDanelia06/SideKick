import { after } from "next/server";
import { log } from "@/lib/logger";
import { PLATFORMS, parseMessagingEvents, tokensMatch, verifySignature } from "@/lib/channels/meta";
import { recordInbound, type RecordedMessage } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";
import { nameCustomer } from "@/lib/channels/profile";

export const dynamic = "force-dynamic";

/** Meta assumes failure and re-sends after this. Everything here is shaped by it. */
const META_DEADLINE_MS = 5_000;

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

/**
 * The setup handshake.
 *
 * Meta calls this once, when the callback URL is saved in the App Dashboard,
 * and again whenever it is changed. It proves we meant to publish this endpoint
 * by asking us to echo a number back, which only somebody holding the verify
 * token can do.
 */
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
    // Warn, not error: a public URL gets probed, and the person setting the app
    // up will mistype this at least once. Neither is a fault in the service.
    log.warn("messenger webhook verify token did not match");
    return text("forbidden", 403);
  }

  // Plain text, and the value unchanged. Meta compares the body byte for byte,
  // so wrapping it in JSON fails verification with no useful error.
  return text(challenge, 200);
}

/**
 * Receives customer messages from Meta.
 *
 * The whole shape of this handler comes from one number: Meta wants a 200
 * within five seconds and re-sends the event when it does not get one. So the
 * request does the least it can — check the signature, write the message down,
 * answer — and everything slow happens after the response has gone.
 *
 * That is why the AI is not called here. Generating a reply takes longer than
 * the deadline, so awaiting it would guarantee a retry, and the retry would
 * arrive while the first one was still thinking.
 *
 * It also answers 200 to messages it cannot place. A Meta app receives events
 * for every page subscribed to it, including pages whose owners never finished
 * connecting here; replying with an error to those would have Meta retry them
 * on a backoff and eventually disable the webhook for everybody.
 *
 * The one thing it does not shrug off is failing to store a message that was
 * ours to store. That gets a 500 so Meta sends it again — see the end of the
 * function for why the retry is safe.
 */
export async function POST(request: Request) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    log.error("messenger webhook called with no META_APP_SECRET set");
    return text("webhook not configured", 503);
  }

  // Read as raw text, not `request.json()`: the signature covers these exact
  // bytes, and re-serialising a parsed object produces different ones.
  const raw = await request.text();

  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"), secret)) {
    // Expected traffic on a public URL, so warn rather than error — but worth
    // recording, because a sudden run of these is either an attempt to inject
    // messages or an app secret that has been rotated on Meta's side.
    log.warn("messenger webhook rejected an unsigned or mis-signed request");
    return text("bad signature", 403);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    // Signed by Meta but not JSON. Nothing to retry into, so accept and drop.
    log.warn("messenger webhook body was signed but unparseable");
    return text("ok", 200);
  }

  const messages = parseMessagingEvents(payload);
  if (messages.length === 0) return text("ok", 200);

  const started = Date.now();
  const recorded: RecordedMessage[] = [];
  let lost = 0;

  for (const message of messages) {
    try {
      const result = await recordInbound(PLATFORMS[message.platform], message);
      // A repeat of one we already have is the retry path working. Storing it
      // was a no-op and telling the AI again would double the reply.
      if (result?.isNew) recorded.push(result);
    } catch (err) {
      // Carry on through the batch — one unstorable message should not cost the
      // others their chance — but remember that it happened, because the reply
      // below depends on it.
      lost += 1;
      log.error("messenger webhook failed to record a message", err, {
        pageId: message.pageId,
        externalId: message.externalId,
      });
    }
  }

  const elapsed = Date.now() - started;
  if (elapsed > META_DEADLINE_MS / 2) {
    // Halfway through the budget on writes alone means retries are close. Worth
    // knowing before they start, because the symptom — duplicate replies — does
    // not look like a slow database.
    log.warn("messenger webhook is approaching Meta's 5s deadline", {
      elapsedMs: elapsed,
      messages: messages.length,
    });
  }

  // Runs once the response is on the wire, so the AI round trip is outside the
  // deadline entirely. Sent even alongside a failure, because the messages that
  // did store are real and the customers who wrote them are waiting.
  after(async () => {
    // Ask Meta who these people are, so the inbox shows names instead of a row
    // of dashes. Deduped because a batch can carry several messages from one
    // customer, and one blank name needs asking about once.
    const unnamed = new Set(recorded.filter((r) => r.needsName).map((r) => r.conversationId));
    for (const conversationId of unnamed) {
      await nameCustomer(conversationId);
    }

    for (const result of recorded) {
      await notifyAgent({
        event: "message.received",
        businessId: result.businessId,
        conversationId: result.conversationId,
        messageId: result.messageId,
        channel: result.channel,
      });
    }
  });

  // Ask Meta to send the batch again.
  //
  // Answering "ok" here would be a lie with a cost: Meta only re-sends what it
  // believes failed, so a message we could not store would be gone for good and
  // the customer would sit waiting for an answer to something nobody ever read.
  // A database blip is exactly the case retries exist for.
  //
  // Safe to ask for because every message carries Meta's `mid`: whatever
  // already stored is recognised on the way back through and skipped, so the
  // customer is neither answered twice nor shown their own question twice.
  //
  // Deliberately narrow. A page we do not know, an echo, a receipt, an
  // unparseable body — none of those reach here, because none of them would be
  // any different the second time and every one of them would be an endless
  // retry of somebody else's traffic.
  if (lost > 0) return text("could not store every message", 500);

  return text("ok", 200);
}
