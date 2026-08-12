import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

/**
 * Turns Meta's authorisation code into two connected channels.
 *
 * One grant covers both surfaces, which is why this connects Facebook and
 * Instagram together rather than asking the merchant to do it twice: Instagram
 * messaging runs on the Messenger Platform, so the credential is the *Page*
 * Access Token either way. Only the id in the path differs — the Page id for
 * Messenger, the Instagram account id for Instagram.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type ConnectResult =
  | { ok: true; pageName: string; instagram: boolean }
  | { ok: false; reason: "unconfigured" | "exchange" | "no_page" | "many_pages" | "failed" };

type Page = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id?: string };
};

async function graph<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}${path}`, {
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

  const igId = page.instagram_business_account?.id ?? null;

  await link(businessId, "FACEBOOK", page.id, page.access_token);
  if (igId) await link(businessId, "INSTAGRAM", igId, page.access_token);

  return { ok: true, pageName: page.name ?? page.id, instagram: Boolean(igId) };
}

/**
 * Writes the credential onto the tenant's existing channel row.
 *
 * Updates rather than creates: every business is provisioned with a row per
 * channel, and creating a second one would leave the dashboard toggling a
 * different row from the one the webhook reads.
 */
async function link(
  businessId: string,
  type: "FACEBOOK" | "INSTAGRAM",
  externalId: string,
  accessToken: string,
): Promise<void> {
  const existing = await prisma.channel.findFirst({
    where: { businessId, type },
    select: { id: true },
  });

  if (existing) {
    await prisma.channel.update({
      where: { id: existing.id },
      data: { externalId, accessToken, connected: true },
    });
    return;
  }

  await prisma.channel.create({
    data: { businessId, type, externalId, accessToken, connected: true },
  });
}
