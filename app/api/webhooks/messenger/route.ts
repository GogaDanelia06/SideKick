import { after } from "next/server";
import { log } from "@/lib/logger";
import { PLATFORMS, parseMessagingEvents, tokensMatch, verifySignature } from "@/lib/channels/meta";
import { recordInbound, type RecordedMessage } from "@/lib/channels/inbound";
import { describe, describeRaw, traceDelivery } from "@/lib/channels/webhookDebug";
import { followUp } from "@/lib/channels/followUp";

export const dynamic = "force-dynamic";

const META_DEADLINE_MS = 5_000;

function text(body: string, status: number) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
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
    log.warn("messenger webhook verify token did not match");
    return text("forbidden", 403);
  }

  return text(challenge, 200);
}

export async function POST(request: Request) {
  const secret = process.env.META_APP_SECRET;
  const instagramSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!secret && !instagramSecret) {
    log.error("messenger webhook called with no META_APP_SECRET set");
    return text("webhook not configured", 503);
  }

  const raw = await request.text();

  if (process.env.DEBUG_WEBHOOK_BODY === "1") {
    log.warn("RAW WEBHOOK DELIVERY — debug logging is on", traceDelivery(request, raw));
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(raw, signature, secret, instagramSecret)) {
    log.warn("messenger webhook rejected an unsigned or mis-signed request", {
      hasSignature: Boolean(signature),
      secretsTried: [secret && "meta", instagramSecret && "instagram"].filter(Boolean).join("+"),
      shape: describeRaw(raw),
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
    log.info("webhook delivery carried no readable message", { shape: describe(payload) });
    return text("ok", 200);
  }

  const started = Date.now();
  const recorded: RecordedMessage[] = [];
  let lost = 0;

  for (const message of messages) {
    try {
      const result = await recordInbound(PLATFORMS[message.platform], message);
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

  after(() => followUp(recorded));

  if (lost > 0) return text("could not store every message", 500);

  return text("ok", 200);
}
