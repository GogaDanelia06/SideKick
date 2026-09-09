import { log } from "@/lib/logger";

/**
 * Trading an Instagram Login authorisation code for a token we can keep.
 *
 * Two calls, not one, and both hosts are Meta's own choice: the code is
 * exchanged on api.instagram.com and the result upgraded on
 * graph.instagram.com. Neither is versioned, unlike every other Graph call in
 * this codebase.
 */

const TOKEN_EXCHANGE = "https://api.instagram.com/oauth/access_token";
const LONG_LIVED = "https://graph.instagram.com/access_token";
const REFRESH = "https://graph.instagram.com/refresh_access_token";
const TIMEOUT_MS = 15_000;

type Json = Record<string, unknown>;

async function request(url: string, body?: URLSearchParams): Promise<Json | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Host and path, never the whole URL. `toLongLived` passes the app secret and
  // the token as query parameters — Meta's documented shape for that call — so
  // logging the URL would print, verbatim into the log stream, the key every
  // Instagram webhook signature on this platform is checked against. Anyone who
  // could read the logs could then forge customer messages for every merchant.
  const endpoint = (() => {
    const parsed = new URL(url);
    return parsed.host + parsed.pathname;
  })();

  try {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      body,
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as Json | null;
    if (!res.ok || !data || data.error_type || data.error) {
      log.error("Instagram Login refused a token call", undefined, {
        endpoint,
        detail: String(data?.error_message ?? data?.error ?? `HTTP ${res.status}`),
      });
      return null;
    }
    return data;
  } catch (err) {
    log.error("Instagram Login token call failed", err, { endpoint });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Trades the authorisation code for a short-lived token (about an hour).
 *
 * Form-encoded rather than a query string, and the redirect_uri repeated even
 * though the code already came back through it — both are Meta's requirements,
 * and omitting either fails with an error that names neither.
 */
export async function exchangeCode(
  appId: string,
  appSecret: string,
  code: string,
  redirectUri: string,
): Promise<string | null> {
  const data = await request(
    TOKEN_EXCHANGE,
    new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      // Instagram appends `#_` to the redirect it sends the browser to. A
      // browser strips the fragment, but a merchant who copies the URL by hand
      // does not, and the exchange then fails on a character nobody can see.
      code: code.replace(/#_$/, ""),
    }),
  );

  const token = data?.access_token;
  return typeof token === "string" && token ? token : null;
}

/**
 * Upgrades the hour-long token to the sixty-day one.
 *
 * Skipping this is the kind of mistake that works perfectly in testing and then
 * breaks every connected account an hour after the merchant walks away.
 */
export type LongLivedToken = { token: string; expiresAt: Date | null };

/**
 * Reads Meta's `expires_in`, which is seconds from now.
 *
 * Absent or nonsensical gives null rather than a guessed date: a refresh job
 * that believes a wrong expiry either renews pointlessly or, worse, lets a
 * token lapse while reporting it healthy.
 */
function expiryFrom(data: Json | null, now = Date.now()): Date | null {
  const seconds = data?.expires_in;
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(now + seconds * 1000);
}

export async function toLongLived(
  appSecret: string,
  shortToken: string,
): Promise<LongLivedToken | null> {
  const url = new URL(LONG_LIVED);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortToken);

  const data = await request(url.toString());
  const token = data?.access_token;
  if (typeof token !== "string" || !token) return null;
  return { token, expiresAt: expiryFrom(data) };
}

/**
 * Renews a long-lived token for another sixty days.
 *
 * Meta refuses a token younger than 24 hours and one that has already lapsed,
 * so this is only useful on a schedule — and only while the token still works.
 * Once it has expired there is no way back except sending the merchant through
 * the consent screen again.
 */
export async function refreshLongLived(token: string): Promise<LongLivedToken | null> {
  const url = new URL(REFRESH);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const data = await request(url.toString());
  const fresh = data?.access_token;
  if (typeof fresh !== "string" || !fresh) return null;
  return { token: fresh, expiresAt: expiryFrom(data) };
}
