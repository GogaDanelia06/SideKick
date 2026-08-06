import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * One customer message, lifted out of Meta's nested envelope.
 *
 * Flattened on purpose: everything downstream cares about who wrote, on which
 * page, and what they said. Keeping Meta's shape any further into the codebase
 * would spread its quirks — echoes, delivery receipts, `entry[].messaging[]` —
 * across code that has no reason to know about them.
 */
export type InboundMessage = {
  /** The Facebook Page id. Routes the message to a tenant. */
  pageId: string;
  /** The customer's page-scoped id (PSID). Identifies the chat. */
  senderId: string;
  text: string;
  /** Meta's `mid`. The key that makes a retry land on the same row. */
  externalId: string;
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

  // Instagram and WhatsApp deliveries have their own `object` and their own
  // event shapes. Refusing them here keeps this function honest about being
  // page-only rather than quietly mis-reading a sibling platform.
  if (!isRecord(payload) || payload.object !== "page") return out;
  if (!Array.isArray(payload.entry)) return out;

  for (const entry of payload.entry) {
    if (!isRecord(entry)) continue;

    const pageId = str(entry.id);
    if (!pageId || !Array.isArray(entry.messaging)) continue;

    for (const event of entry.messaging) {
      if (!isRecord(event)) continue;

      const message = isRecord(event.message) ? event.message : null;
      if (!message || message.is_echo === true) continue;

      const senderId = isRecord(event.sender) ? str(event.sender.id) : null;
      const externalId = str(message.mid);
      const text = str(message.text);

      // An attachment-only message has no text. There is nothing for a text
      // model to answer, and inventing a placeholder would put words the
      // customer never wrote into the tenant's inbox.
      if (!senderId || !externalId || !text) continue;

      out.push({ pageId, senderId, text, externalId });
    }
  }

  return out;
}
