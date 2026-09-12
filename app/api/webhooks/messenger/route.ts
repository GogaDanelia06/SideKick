import { after } from "next/server";
import { log } from "@/lib/logger";
import { PLATFORMS, parseMessagingEvents, tokensMatch, verifySignature } from "@/lib/channels/meta";
import { recordInbound, type RecordedMessage } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";
import { nameCustomer } from "@/lib/channels/profile";
import { describe, traceDelivery } from "@/lib/channels/webhookDebug";
import { answerAfterQuietWindow } from "@/lib/ai/quietWindow";

export const dynamic = "force-dynamic";

/** Meta assumes failure and re-sends after this. Everything here is shaped by it. */
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

  if (process.env.DEBUG_WEBHOOK_BODY === "1") {
    // Safe to leave on: the envelope is kept and every human-written field is
    // replaced by its length. See lib/channels/webhookDebug.ts for why that is
    // enough — the diagnosis was always in the shape, never in the words.
    //
    // Before the signature check on purpose. A delivery we *reject* is often
    // the one worth reading: an unexpected signing secret looks exactly like a
    // forged request until you can see the envelope was Meta's own.
    log.warn("RAW WEBHOOK DELIVERY — debug logging is on", traceDelivery(request, raw));
  }

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

    // Counted out loud, because the silence had two possible meanings and no way
    // to tell them apart: either nothing was queued for naming, or naming ran
    // and gave up without a word. Every branch inside `nameCustomer` now says
    // something, so a run with candidates and no further line means the call
    // never happened — and this is the line that proves which.
    log.info("naming queue", {
      recorded: recorded.length,
      needName: unnamed.size,
      channels: [...new Set(recorded.map((r) => r.channel))].join(","),
    });

    // Naming, the notice and the reply start together rather than in turn. In
    // turn, the reply queued behind a profile lookup at Meta and then a notice
    // to the AI service that may take its whole ten-second timeout per message —
    // all of it added to the customer's wait before the quiet window had even
    // begun. None of the three needs another's result: the reply never reads
    // the customer's name.
    const naming = (async () => {
      for (const conversationId of unnamed) await nameCustomer(conversationId);
    })();

    // The notice goes out for every message: it announces that something
    // arrived and is a separate concern from answering it.
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

    // The replies run together rather than one after another, because each one
    // waits out a quiet window before deciding whether it is the message that
    // should answer. Sequentially, three messages would wait three windows and
    // the customer would be answered a minute and a half after they finished
    // talking; in parallel they wait the same window once, and the last one
    // through answers for all three. See lib/ai/quietWindow.ts.
    //
    // Settled, not `Promise.all`: the function stays alive only until this
    // settles, and one early failure would end it while other customers' replies
    // were still waiting out their window.
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
