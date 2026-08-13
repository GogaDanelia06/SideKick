import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Which Meta surface a delivery came from.
 *
 * Both arrive at the same callback URL, because they belong to the same app.
 * The only thing that distinguishes them is the `object` at the top of the
 * envelope, so it is read once here rather than guessed at further in.
 */
export const PLATFORMS = { page: "FACEBOOK", instagram: "INSTAGRAM" } as const;

export type MetaPlatform = keyof typeof PLATFORMS;

/**
 * One customer message, lifted out of Meta's nested envelope.
 *
 * Flattened on purpose: everything downstream cares about who wrote, where, and
 * what they said. Keeping Meta's shape any further into the codebase would
 * spread its quirks — echoes, delivery receipts, `entry[].messaging[]` — across
 * code that has no reason to know about them.
 */
export type InboundMessage = {
  /**
   * The account the message arrived at — a Facebook Page id, or an Instagram
   * professional account id. Either way it is what routes to a tenant.
   */
  pageId: string;
  /**
   * The customer's id as that platform scopes it: a PSID on Facebook, an IGSID
   * on Instagram. Both are per-account, so neither identifies a person across
   * two merchants.
   */
  senderId: string;
  text: string;
  /** Meta's `mid`. The key that makes a retry land on the same row. */
  externalId: string;
  /** Which surface it came from, so the reply goes back the same way. */
  platform: MetaPlatform;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Answers whether a request really came from Meta.
 *
 * The endpoint has to be reachable by anyone, so this signature is the only
 * thing standing between the tenant's inbox and forged messages: without it a
 * stranger could put words in a customer's mouth and make the AI answer them.
 *
 * Two details are load-bearing. The HMAC must be taken over the *raw* body,
 * because re-serialising the parsed JSON produces different bytes and a
 * signature that never matches. And the comparison is timing-safe, so a
 * attacker cannot learn the right digest one byte at a time from how long the
 * rejection takes.
 */
export function verifySignature(
  rawBody: string,
  header: string | null | undefined,
  appSecret: string,
): boolean {
  if (!header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  // Buffer.from truncates at the first invalid pair rather than throwing, so a
  // malformed header shows up as a length mismatch instead of an exception.
  const given = Buffer.from(header.slice("sha256=".length), "hex");

  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Compares the token Meta echoes during the setup handshake against ours.
 *
 * Split out only so the comparison is timing-safe like the signature one. The
 * handshake is rare and its token is not a live secret, but a plain `===` here
 * next to a careful compare below invites someone to copy the wrong one.
 */
export function tokensMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Picks the actual customer messages out of a webhook delivery.
 *
 * Meta sends far more than messages down this pipe — delivery receipts, read
 * receipts, postbacks, reactions — and batches several events into one request.
 * Everything this function does not recognise is dropped rather than guessed
 * at, because a half-understood event stored as a message is worse than one
 * that never arrived.
 *
 * The `is_echo` skip is the one to be careful about. If the page subscribes to
 * message echoes, every reply *we* send comes straight back through this
 * endpoint. Recorded as a customer message it would mean the AI reads its own
 * answer as a new question and replies to itself, forever.
 */
export function parseMessagingEvents(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = [];

  // Facebook and Instagram send the same envelope with a different `object`, so
  // both are read here. WhatsApp is not: its events have a different shape
  // entirely, and accepting it would mean quietly mis-reading them.
  if (!isRecord(payload)) return out;

  const platform = typeof payload.object === "string" ? payload.object : "";
  if (!(platform in PLATFORMS)) return out;
  if (!Array.isArray(payload.entry)) return out;

  for (const entry of payload.entry) {
    if (!isRecord(entry)) continue;

    const pageId = str(entry.id);
    if (!pageId) continue;

    for (const event of messagingEvents(entry)) {
      const message = isRecord(event.message) ? event.message : null;
      if (!message || message.is_echo === true) continue;

      const senderId = isRecord(event.sender) ? str(event.sender.id) : null;
      const externalId = str(message.mid);
      const text = str(message.text);

      // An attachment-only message has no text. There is nothing for a text
      // model to answer, and inventing a placeholder would put words the
      // customer never wrote into the tenant's inbox.
      if (!senderId || !externalId || !text) continue;

      out.push({ pageId, senderId, text, externalId, platform: platform as MetaPlatform });
    }
  }

  return out;
}

/**
 * The message events inside one entry, from either shape Meta uses.
 *
 * `messaging[]` is what the Messenger Platform sends. The Instagram API with
 * Instagram Login can instead wrap the same object in `changes[]` with a
 * `field` saying what it is — the payload underneath is identical.
 *
 * Reading only one of the two is the expensive kind of mistake: the delivery
 * arrives, the signature checks out, we answer 200, and the message is dropped
 * without a trace. Accepting both costs nothing, because anything that does not
 * look like a message is discarded a few lines below either way.
 */
function messagingEvents(entry: Record<string, unknown>): Record<string, unknown>[] {
  const events: Record<string, unknown>[] = [];

  if (Array.isArray(entry.messaging)) {
    for (const event of entry.messaging) if (isRecord(event)) events.push(event);
  }

  if (Array.isArray(entry.changes)) {
    for (const change of entry.changes) {
      if (!isRecord(change)) continue;
      // Comments, mentions and story insights arrive here too, under their own
      // field names. Only messages belong in an inbox.
      if (change.field !== "messages") continue;
      if (isRecord(change.value)) events.push(change.value);
    }
  }

  return events;
}
