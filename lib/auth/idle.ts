/**
 * Ends a session that has gone quiet.
 *
 * People expect quitting the browser to sign them out. It cannot: no signal
 * reaches the server when a window closes, and Chrome and Safari hand the same
 * session cookie back when they restore. What *is* observable is silence — and
 * a browser that was quit produces exactly that.
 *
 * So the rule is idleness, not closure. Stop using the dashboard for half an
 * hour and the session ends, whether you closed the window, walked away, or
 * left it open on a screen in a shop. The second case is the one that actually
 * matters for a merchant's inbox.
 *
 * Kept out of the Auth.js token deliberately. Writing a moving timestamp into
 * the JWT makes Auth.js re-issue its cookie with the configured seven-day
 * `maxAge`, which would restore the very expiry the sign-in flow strips off.
 * A separate cookie has no such side effect — see [[sessionExpiry]] for the
 * absolute cap that backs this up.
 */

/** How long a session may go untouched before it is refused. */
export const IDLE_MAX_SEC = 30 * 60;

/** Rewriting on every request is wasteful; the marker is refreshed past this. */
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

/** Constant-time for the same reason the webhook's signature check is. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Stamps the current time, signed.
 *
 * Signed because the cookie is otherwise a number the browser owns: anyone
 * could put tomorrow's date in it and never be signed out again, which is the
 * whole control undone.
 */
export async function stampMarker(secret: string, now = Date.now()): Promise<string> {
  const ts = String(now);
  return `${ts}.${await hmac(secret, ts)}`;
}

/**
 * Reads a marker back, or null if it is missing, malformed or forged.
 *
 * Null is not "expired" — it is "no usable marker". The caller decides what
 * that means, and it must be treated as a fresh visit rather than an idle one,
 * or every user signs out the moment this ships.
 */
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

/** Whether the gap since `seenAt` is long enough to end the session. */
export function isIdle(seenAt: number, now = Date.now()): boolean {
  // A clock that has gone backwards must not expire anything, same as the
  // absolute check.
  return (now - seenAt) / 1000 > IDLE_MAX_SEC;
}

/** Whether the marker is old enough to be worth writing again. */
export function needsRefresh(seenAt: number, now = Date.now()): boolean {
  return (now - seenAt) / 1000 > REFRESH_AFTER_SEC;
}
