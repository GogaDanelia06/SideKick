import { after } from "next/server";
import { log } from "@/lib/logger";
import { PLATFORMS, parseMessagingEvents, tokensMatch, verifySignature } from "@/lib/channels/meta";
import { recordInbound, type RecordedMessage } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";
import { nameCustomer } from "@/lib/channels/profile";
import { answerCustomer } from "@/lib/ai/answer";

export const dynamic = "force-dynamic";

/** Meta assumes failure and re-sends after this. Everything here is shaped by it. */
const META_DEADLINE_MS = 5_000;

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

/**
 * The skeleton of a payload: which keys, in which order, nothing inside them.
 *
 * Deliberately not the body. Knowing that Meta sent `entry[].changes[]` rather
 * than `entry[].messaging[]` is the whole diagnosis, and none of the words a
 * customer typed are needed to see it.
 */
function describe(payload: unknown): string {
  if (!payload || typeof payload !== "object") return typeof payload;
  const top = payload as Record<string, unknown>;
  const entry = Array.isArray(top.entry) && top.entry[0] ? top.entry[0] : null;
  const inner = entry && typeof entry === "object" ? Object.keys(entry).join(",") : "—";

  const first =
    entry && typeof entry === "object"
      ? ((entry as Record<string, unknown>).messaging ?? (entry as Record<string, unknown>).changes)
      : null;
  const leaf =
    Array.isArray(first) && first[0] && typeof first[0] === "object"
      ? Object.keys(first[0] as Record<string, unknown>).join(",")
      : "—";

  return `object=${String(top.object)} entry[0]={${inner}} first={${leaf}}`;
}

/** Bodies are small; this only guards against a pathological one. */
const DEBUG_MAX_CHARS = 4_000;

/**
 * Writes the whole delivery to the log, verbatim.
 *
 * Off unless `DEBUG_WEBHOOK_BODY` is set, and meant to be switched off again as
 * soon as the question it was turned on for is answered. What it prints is
 * every word a customer wrote — turning it on leaves their messages sitting in
 * a log aggregator, which is not where a merchant's inbox belongs.
 *
 * Deliberately before the signature check, because a delivery we *reject* is
 * often the one worth reading: that is what an unexpected signing secret, or a
 * forged request, actually looks like on the wire.
 */
function debugDelivery(request: Request, raw: string): void {
  if (process.env.DEBUG_WEBHOOK_BODY !== "1") return;

  log.warn("RAW WEBHOOK DELIVERY — debug logging is on, turn it off when done", {
    userAgent: request.headers.get("user-agent"),
    signature: request.headers.get("x-hub-signature-256"),
    bytes: raw.length,
    body: raw.slice(0, DEBUG_MAX_CHARS),
  });
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


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
  // Two secrets, because Instagram Login is a separate app with its own. The
  // Facebook one alone silently rejected every Instagram delivery.
  const secret = process.env.META_APP_SECRET;
  const instagramSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!secret && !instagramSecret) {
    log.error("messenger webhook called with no META_APP_SECRET set");
    return text("webhook not configured", 503);
  }

  // Read as raw text, not `request.json()`: the signature covers these exact
  // bytes, and re-serialising a parsed object produces different ones.
  const raw = await request.text();

  debugDelivery(request, raw);

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(raw, signature, secret, instagramSecret)) {
    // Expected traffic on a public URL, so warn rather than error — but worth
    // recording, because a sudden run of these is either an attempt to inject
    // messages or an app secret that has been rotated on Meta's side.
    //
    // The envelope is named: a signed delivery we reject is indistinguishable
    // from a stranger poking the URL until you can see it was Meta's own
    // Instagram payload arriving under a secret we were not checking.
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
    // Signed by Meta but not JSON. Nothing to retry into, so accept and drop.
    log.warn("messenger webhook body was signed but unparseable");
    return text("ok", 200);
  }

  const messages = parseMessagingEvents(payload);

  if (messages.length === 0) {
    // Signed by Meta, and yet nothing we recognise. Mostly this is ordinary —
    // an echo, a read receipt, a delivery confirmation — but it is also exactly
    // what an unfamiliar payload shape looks like, and those two must not be
    // indistinguishable. Silence here once cost a day of blaming the wrong side.
    //
    // The shape is logged, never the contents: enough to see how Meta wrapped
    // it, without copying a customer's message into a second system's logs.
    log.info("webhook delivery carried no readable message", { shape: describe(payload) });
    return text("ok", 200);
  }

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
      // Kept for anyone subscribed to the push. It is a separate concern from
      // the answer below: one announces that a message arrived, the other is
      // the reply going back out.
      await notifyAgent({
        event: "message.received",
        businessId: result.businessId,
        conversationId: result.conversationId,
        messageId: result.messageId,
        channel: result.channel,
      });

      // The AI service answers in the same call rather than pushing to us
      // later, so this is where the customer's reply is written and sent. Slow
      // by nature, and safely so: the 200 went out before `after()` began.
      await answerCustomer(result.businessId, result.conversationId, result.text);
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
