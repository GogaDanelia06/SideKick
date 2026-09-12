/**
 * Idle sign-out: a signed cookie records the last activity, and a session unused
 * for IDLE_MAX_SEC is refused. Kept outside the Auth.js JWT, because updating the
 * token would re-issue its cookie with the 7-day maxAge.
 */

export const IDLE_MAX_SEC = 30 * 60;

/** The marker is rewritten at most this often. */
const REFRESH_AFTER_SEC = 60;

export const IDLE_COOKIE = "sk.seen";

const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The current time, signed so the browser cannot forge it. */
export async function stampMarker(secret: string, now = Date.now()): Promise<string> {
  const ts = String(now);
  return `${ts}.${await hmac(secret, ts)}`;
}

/** The marker's timestamp, or null when missing, malformed or forged (treated as a fresh visit). */
export async function readMarker(
  value: string | undefined,
  secret: string,
): Promise<number | null> {
  if (!value) return null;

  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const ts = value.slice(0, dot);
  const given = value.slice(dot + 1);
  if (!/^\d+$/.test(ts)) return null;

  return equal(given, await hmac(secret, ts)) ? Number(ts) : null;
}

export function isIdle(seenAt: number, now = Date.now()): boolean {
  return (now - seenAt) / 1000 > IDLE_MAX_SEC;
}

export function needsRefresh(seenAt: number, now = Date.now()): boolean {
  return (now - seenAt) / 1000 > REFRESH_AFTER_SEC;
}
