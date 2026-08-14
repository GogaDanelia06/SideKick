import { log } from "@/lib/logger";

/**
 * The Graph half of Instagram Login: who we just connected, and telling Meta to
 * actually send us their messages.
 */

const GRAPH = "https://graph.instagram.com";
const VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type InstagramAccount = { id: string; username: string };

async function call(
  path: string,
  token: string,
  method: "GET" | "POST",
): Promise<Record<string, unknown> | null> {
  const url = new URL(`${GRAPH}/${VERSION}${path}`);
  url.searchParams.set("access_token", token);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method, signal: controller.signal });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !data || data.error) {
      const error = data?.error as { message?: string } | undefined;
      log.error("Instagram Graph call failed", undefined, {
        path,
        detail: error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }
    return data;
  } catch (err) {
    log.error("Instagram Graph call threw", err, { path });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The account this token belongs to.
 *
 * `user_id` is taken, not `id`, and the difference matters. The same call
 * returns both — `user_id` is the Instagram professional account id (the one
 * beginning 17841…), `id` is an app-scoped id — and only the first is what Meta
 * puts in `entry.id` on an incoming webhook. Storing the wrong one produces a
 * connection that looks complete in the dashboard and drops every message,
 * because the lookup in recordInbound never matches.
 */
export async function fetchAccount(token: string): Promise<InstagramAccount | null> {
  const data = await call("/me?fields=user_id,username", token, "GET");
  const id = data?.user_id;

  // A string, or nothing. Meta sends these ids quoted for a reason: they are
  // past 2^53, so a bare JSON number is already rounded by the time JSON.parse
  // hands it over — 17841436214263005 arrives as …004. Coercing that back to a
  // string would store an id that is off by one and matches no webhook, which
  // is far worse than refusing to connect and saying so.
  if (typeof id !== "string" || !id) {
    if (id !== undefined) {
      log.error("Instagram returned a user_id that was not a string", undefined, {
        received: typeof id,
      });
    }
    return null;
  }

  return { id, username: typeof data?.username === "string" ? data.username : "" };
}

/**
 * Subscribes the account to our app's `messages` webhook.
 *
 * This is the step whose absence caused the silence. A webhook URL saved in the
 * App Dashboard only says *where* Meta should deliver; this says *which
 * account's* events to deliver at all. Without it the endpoint is live, the
 * signature is right, the account is authorised — and nothing ever arrives,
 * which is indistinguishable from a broken deployment until you know to look.
 *
 * Returns false rather than throwing: the credential is worth keeping even when
 * this fails, because it can be retried by reconnecting, and losing the token
 * would make the merchant redo the consent screen for no reason.
 */
export async function subscribeToMessages(token: string): Promise<boolean> {
  const data = await call("/me/subscribed_apps?subscribed_fields=messages", token, "POST");
  return data?.success === true;
}
