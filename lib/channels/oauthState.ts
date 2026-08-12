import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The `state` parameter Meta hands back with the authorisation code.
 *
 * It exists to answer one question on the way back: was this round trip started
 * by the person now returning? Without that, an attacker can begin their own
 * authorisation, keep the resulting link, and get a signed-in merchant to open
 * it — which would attach the attacker's Instagram account to the merchant's
 * business, and every customer message with it.
 *
 * So the value is signed with our own secret and carries the business it was
 * issued for. The callback checks the signature, checks it has not gone stale,
 * and checks the business matches the session that came back. All three have to
 * hold; any one of them alone is bypassable.
 */

/** Long enough to read Meta's consent screen, short enough to be worthless later. */
const MAX_AGE_SEC = 15 * 60;

const secret = () => process.env.AUTH_SECRET ?? "";

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

function equal(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Builds a state value for one authorisation attempt. */
export function issueState(businessId: string, now = Date.now()): string {
  // The nonce makes two attempts from the same business distinguishable, so a
  // captured link cannot be replayed as a different one.
  const payload = Buffer.from(
    JSON.stringify({ b: businessId, n: randomBytes(9).toString("hex"), t: now }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/**
 * Reads a state back, or null when it is missing, forged or expired.
 *
 * Null always means "do not proceed". It never means "probably fine" — a
 * callback that cannot prove where it came from is exactly the case this guards.
 */
export function readState(value: string | null, now = Date.now()): { businessId: string } | null {
  if (!value) return null;

  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = value.slice(0, dot);
  if (!equal(value.slice(dot + 1), sign(payload))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      b?: unknown;
      t?: unknown;
    };
    if (typeof data.b !== "string" || typeof data.t !== "number") return null;
    // A clock that has gone backwards must not reject anything, so only the
    // forward direction is treated as expiry.
    if ((now - data.t) / 1000 > MAX_AGE_SEC) return null;

    return { businessId: data.b };
  } catch {
    return null;
  }
}
