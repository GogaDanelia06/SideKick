import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed OAuth `state`: binds a Meta authorisation round trip to the business that
 * started it, so an attacker's account cannot be attached to someone else's.
 */

const MAX_AGE_SEC = 15 * 60;

const secret = () => process.env.AUTH_SECRET ?? "";

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

function equal(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function issueState(businessId: string, now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ b: businessId, n: randomBytes(9).toString("hex"), t: now }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** The state's business, or null when it is missing, forged or expired. */
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
    // A timestamp from the future (clock skew) is not treated as expired.
    if ((now - data.t) / 1000 > MAX_AGE_SEC) return null;

    return { businessId: data.b };
  } catch {
    return null;
  }
}
