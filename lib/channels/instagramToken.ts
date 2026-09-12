import { log } from "@/lib/logger";

/**
 * Instagram Login token exchange: code → short-lived token (api.instagram.com)
 * → 60-day token (graph.instagram.com). Neither endpoint is versioned.
 */

const TOKEN_EXCHANGE = "https://api.instagram.com/oauth/access_token";
const LONG_LIVED = "https://graph.instagram.com/access_token";
const REFRESH = "https://graph.instagram.com/refresh_access_token";
const TIMEOUT_MS = 15_000;

type Json = Record<string, unknown>;

async function request(url: string, body?: URLSearchParams): Promise<Json | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Host and path only: the query string carries the app secret and the token.
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

/** Code → short-lived token. Meta requires a form body and the same redirect_uri. */
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
      // Instagram appends "#_" to the code it redirects with.
      code: code.replace(/#_$/, ""),
    }),
  );

  const token = data?.access_token;
  return typeof token === "string" && token ? token : null;
}

export type LongLivedToken = { token: string; expiresAt: Date | null };

/** Meta's `expires_in` (seconds from now) as a date; null when missing or invalid. */
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

/** Extends a long-lived token by 60 days. Meta only allows it for valid tokens older than 24h. */
export async function refreshLongLived(token: string): Promise<LongLivedToken | null> {
  const url = new URL(REFRESH);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const data = await request(url.toString());
  const fresh = data?.access_token;
  if (typeof fresh !== "string" || !fresh) return null;
  return { token: fresh, expiresAt: expiryFrom(data) };
}
