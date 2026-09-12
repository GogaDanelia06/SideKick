import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";

/**
 * Facebook Login: turns an authorisation code into a connected Messenger channel,
 * and links the Page's Instagram account when it has one.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type ConnectResult =
  | { ok: true; pageName: string; instagram: boolean }
  | {
      ok: false;
      reason:
        | "unconfigured"
        | "exchange"
        | "no_page"
        | "many_pages"
        | "failed"
        | "not_subscribed"
        | "limit"
        | "already_linked";
    };

type Page = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id?: string };
};

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
    `/me/accounts?fields=id,name,access_token,instagram_business_account{id}` +
      `&access_token=${encodeURIComponent(token.access_token)}`,
  );
  const list = pages?.data ?? [];

  if (list.length === 0) return { ok: false, reason: "no_page" };
  // Guessing between several pages could route another business's customers
  // here, so the merchant picks one on Meta's consent screen instead.
  if (list.length > 1) return { ok: false, reason: "many_pages" };

  const page = list[0];
  if (!page.access_token) return { ok: false, reason: "failed" };

  const linked = await linkChannel(businessId, "FACEBOOK", page.id, page.access_token);
  if (!linked.ok) return { ok: false, reason: linked.reason };

  // Without a Page subscription Meta delivers nothing (needs pages_manage_metadata).
  if (!(await subscribePage(page.id, page.access_token))) {
    return { ok: false, reason: "not_subscribed" };
  }

  const instagram = await linkInstagramFromPage(businessId, page);

  return { ok: true, pageName: page.name ?? page.id, instagram };
}

/**
 * Links the Instagram account attached to this Page (the Messenger Platform route).
 * Stores the Instagram account id, which webhooks carry in `entry.id`. An Instagram
 * Login token for the same account is kept (it is the better credential); one for
 * a different account is replaced.
 */
async function linkInstagramFromPage(businessId: string, page: Page): Promise<boolean> {
  const igId = page.instagram_business_account?.id;
  if (!igId || !page.access_token) return false;

  const existing = await prisma.channel.findFirst({
    where: { businessId, type: "INSTAGRAM" },
    select: { externalId: true, accessToken: true },
  });
  if (existing?.accessToken?.startsWith("IGA") && existing.externalId === igId) {
    log.info("Instagram already holds an Instagram Login token for this account", {
      businessId,
      accountId: igId,
    });
    return true;
  }

  if (existing?.externalId && existing.externalId !== igId) {
    log.warn("replacing the Instagram account on this channel", {
      businessId,
      was: existing.externalId,
      now: igId,
    });
  }

  const linked = await linkChannel(businessId, "INSTAGRAM", igId, page.access_token);
  if (!linked.ok) {
    log.warn("could not carry the Page's Instagram account across", {
      businessId,
      reason: linked.reason,
    });
    return false;
  }

  log.info("Instagram linked through the Facebook Page", { businessId, accountId: igId });
  return true;
}

async function subscribePage(pageId: string, pageToken: string): Promise<boolean> {
  const result = await graphPost<{ success?: boolean }>(
    `/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks` +
      `&access_token=${encodeURIComponent(pageToken)}`,
  );
  return result?.success === true;
}
