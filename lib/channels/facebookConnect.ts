import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";

/**
 * Turns a Facebook Login authorisation code into a connected Messenger channel.
 *
 * Also carries across the Instagram account the Page is linked to, when there
 * is one. That is a *second* road to the same Instagram inbox — the Messenger
 * Platform, on the Page's token — and it exists for merchants who will grant a
 * Page but not hand over their Instagram password. It never overwrites a
 * credential from Instagram Login, which is the better of the two; see
 * `linkInstagramFromPage` below and instagramConnect.ts for that other road.
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
  // Meta's own consent screen already asks which pages to grant, so the honest
  // fix for several is to send the merchant back to pick one there rather than
  // to guess here — connecting the wrong page would route a stranger's
  // customers into this inbox.
  if (list.length > 1) return { ok: false, reason: "many_pages" };

  const page = list[0];
  if (!page.access_token) return { ok: false, reason: "failed" };

  const linked = await linkChannel(businessId, "FACEBOOK", page.id, page.access_token);
  if (!linked.ok) return { ok: false, reason: linked.reason };

  // Saving the webhook URL in the App Dashboard says *where* Meta delivers.
  // This says *which Page's* events to deliver at all, and without it a Page
  // that authorised perfectly still produces total silence. It is the reason
  // `pages_manage_metadata` is in the scope list.
  if (!(await subscribePage(page.id, page.access_token))) {
    return { ok: false, reason: "not_subscribed" };
  }

  const instagram = await linkInstagramFromPage(businessId, page);

  return { ok: true, pageName: page.name ?? page.id, instagram };
}

/**
 * Carries the Instagram account attached to this Page across with the grant.
 *
 * Instagram messages reach an app by two roads, and this is the second one: the
 * Messenger Platform delivers them through the Page the account is linked to,
 * on the Page's own token. It exists because the first road — Instagram Login —
 * asks the merchant for the Instagram account's password, and plenty of
 * merchants will hand over a Page but not that.
 *
 * The account id is stored, not the Page id, because that is what Meta puts in
 * `entry.id` on the way in and it is what `recordInbound` routes on. Replies go
 * out addressed as `me` instead — see `route` in send.ts.
 *
 * Never overwrites an Instagram Login credential. An `IGA…` token is the better
 * of the two: it reaches graph.instagram.com directly and does not expire with
 * the Page grant. Clobbering a working one with a Page token would be a silent
 * downgrade of a channel that was already answering customers.
 */
async function linkInstagramFromPage(businessId: string, page: Page): Promise<boolean> {
  const igId = page.instagram_business_account?.id;
  if (!igId || !page.access_token) return false;

  const existing = await prisma.channel.findFirst({
    where: { businessId, type: "INSTAGRAM" },
    select: { accessToken: true },
  });
  if (existing?.accessToken?.startsWith("IGA")) {
    log.info("Instagram already holds an Instagram Login token — leaving it alone", {
      businessId,
    });
    return true;
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

/** Subscribes one Page to this app's message webhooks. */
async function subscribePage(pageId: string, pageToken: string): Promise<boolean> {
  const result = await graphPost<{ success?: boolean }>(
    `/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks` +
      `&access_token=${encodeURIComponent(pageToken)}`,
  );
  return result?.success === true;
}
