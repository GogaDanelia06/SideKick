import { linkChannel } from "./linkChannel";
import { type Page, graph, graphPost } from "./connectGraph";
import { linkInstagramFromPage } from "./instagramFromPage";

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
  if (list.length > 1) return { ok: false, reason: "many_pages" };

  const page = list[0];
  if (!page.access_token) return { ok: false, reason: "failed" };

  const linked = await linkChannel(businessId, "FACEBOOK", page.id, page.access_token);
  if (!linked.ok) return { ok: false, reason: linked.reason };

  if (!(await subscribePage(page.id, page.access_token))) {
    return { ok: false, reason: "not_subscribed" };
  }

  const instagram = await linkInstagramFromPage(businessId, page);

  return { ok: true, pageName: page.name ?? page.id, instagram };
}

async function subscribePage(pageId: string, pageToken: string): Promise<boolean> {
  const result = await graphPost<{ success?: boolean }>(
    `/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks` +
      `&access_token=${encodeURIComponent(pageToken)}`,
  );
  return result?.success === true;
}
