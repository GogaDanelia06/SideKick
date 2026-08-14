import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";

/**
 * Turns a Facebook Login authorisation code into a connected Messenger channel.
 *
 * Facebook only. Instagram used to be connected from here too, on the theory
 * that one grant covered both — it does not. Instagram messaging on this
 * account runs on Instagram Login, with its own app credentials and its own
 * token, and the Page token this flow returns is rejected by
 * graph.instagram.com outright. See instagramConnect.ts for that half.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type ConnectResult =
  | { ok: true; pageName: string }
  | {
      ok: false;
      reason: "unconfigured" | "exchange" | "no_page" | "many_pages" | "failed" | "not_subscribed";
    };

type Page = { id: string; name?: string; access_token?: string };

const graph = <T>(path: string) => call<T>(path, "GET");
const graphPost = <T>(path: string) => call<T>(path, "POST");

async function call<T>(path: string, method: "GET" | "POST"): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}${path}`, {
      method,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error) {
      log.error("Meta refused a Graph call during connect", undefined, {
        detail: body?.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }
    return body as T;
  } catch (err) {
    log.error("Graph call failed during connect", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function connectFromCode(
  businessId: string,
  code: string,
  redirectUri: string,
): Promise<ConnectResult> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return { ok: false, reason: "unconfigured" };

  const token = await graph<{ access_token?: string }>(
    `/oauth/access_token?client_id=${appId}&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`,
  );
  if (!token?.access_token) return { ok: false, reason: "exchange" };

  const pages = await graph<{ data?: Page[] }>(
    `/me/accounts?fields=id,name,access_token` +
      `&access_token=${encodeURIComponent(token.access_token)}`,
  );
  const list = pages?.data ?? [];

  if (list.length === 0) return { ok: false, reason: "no_page" };
  // Meta's own consent screen already asks which pages to grant, so the honest
  // fix for several is to send the merchant back to pick one there rather than
  // to guess here — connecting the wrong page would route a stranger's
  // customers into this inbox.
  if (list.length > 1) return { ok: false, reason: "many_pages" };

  const page = list[0];
  if (!page.access_token) return { ok: false, reason: "failed" };

  await linkChannel(businessId, "FACEBOOK", page.id, page.access_token);

  // Saving the webhook URL in the App Dashboard says *where* Meta delivers.
  // This says *which Page's* events to deliver at all, and without it a Page
  // that authorised perfectly still produces total silence. It is the reason
  // `pages_manage_metadata` is in the scope list.
  if (!(await subscribePage(page.id, page.access_token))) {
    return { ok: false, reason: "not_subscribed" };
  }

  return { ok: true, pageName: page.name ?? page.id };
}

/** Subscribes one Page to this app's message webhooks. */
async function subscribePage(pageId: string, pageToken: string): Promise<boolean> {
  const result = await graphPost<{ success?: boolean }>(
    `/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks` +
      `&access_token=${encodeURIComponent(pageToken)}`,
  );
  return result?.success === true;
}
