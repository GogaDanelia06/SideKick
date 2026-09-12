import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";
import { exchangeCode, toLongLived } from "./instagramToken";
import { fetchAccount, subscribeToMessages } from "./instagramAccount";

/**
 * Instagram Login: exchanges the authorisation code, stores the long-lived token
 * and subscribes the account to message webhooks. Every step is required.
 */

export type InstagramConnectResult =
  | { ok: true; username: string; accountId: string }
  | {
      ok: false;
      reason:
        | "unconfigured"
        | "exchange"
        | "long_lived"
        | "no_account"
        | "not_subscribed"
        | "limit"
        | "already_linked";
    };

export async function connectInstagramFromCode(
  businessId: string,
  code: string,
  redirectUri: string,
): Promise<InstagramConnectResult> {
  // Instagram Login is a separate Meta app with its own id and secret.
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) return { ok: false, reason: "unconfigured" };

  const short = await exchangeCode(appId, appSecret, code, redirectUri);
  if (!short) return { ok: false, reason: "exchange" };

  const long = await toLongLived(appSecret, short);
  if (!long) return { ok: false, reason: "long_lived" };

  const account = await fetchAccount(long.token);
  if (!account) return { ok: false, reason: "no_account" };

  // Stored before subscribing, so a failed subscription can be retried by reconnecting.
  const linked = await linkChannel(businessId, "INSTAGRAM", account.id, long.token, long.expiresAt);
  if (!linked.ok) return { ok: false, reason: linked.reason };

  const subscribed = await subscribeToMessages(long.token);
  if (!subscribed) {
    log.error("Instagram account linked but not subscribed to the messages webhook", undefined, {
      businessId,
      accountId: account.id,
    });
    return { ok: false, reason: "not_subscribed" };
  }

  log.info("Instagram channel connected and subscribed", {
    businessId,
    accountId: account.id,
    username: account.username,
  });

  return { ok: true, username: account.username, accountId: account.id };
}
