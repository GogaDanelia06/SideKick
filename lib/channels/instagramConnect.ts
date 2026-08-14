import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";
import { exchangeCode, toLongLived } from "./instagramToken";
import { fetchAccount, subscribeToMessages } from "./instagramAccount";

/**
 * Turns an Instagram Login authorisation code into a connected Instagram
 * channel that Meta will actually deliver messages to.
 *
 * Four steps, and every one of them is required. Skipping the last is what made
 * a "connected" account receive nothing at all, so it is treated as a failure
 * here rather than a warning nobody reads.
 */

export type InstagramConnectResult =
  | { ok: true; username: string; accountId: string }
  | {
      ok: false;
      reason: "unconfigured" | "exchange" | "long_lived" | "no_account" | "not_subscribed";
    };

export async function connectInstagramFromCode(
  businessId: string,
  code: string,
  redirectUri: string,
): Promise<InstagramConnectResult> {
  // Its own app id and secret. The Facebook app's credentials are a different
  // application as far as Instagram Login is concerned and are rejected here.
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) return { ok: false, reason: "unconfigured" };

  const short = await exchangeCode(appId, appSecret, code, redirectUri);
  if (!short) return { ok: false, reason: "exchange" };

  const token = await toLongLived(appSecret, short);
  if (!token) return { ok: false, reason: "long_lived" };

  const account = await fetchAccount(token);
  if (!account) return { ok: false, reason: "no_account" };

  // Stored before the subscription is attempted, on purpose. If subscribing
  // fails the merchant should be able to retry from a connected state rather
  // than walk back through Meta's consent screen for a token we already hold.
  await linkChannel(businessId, "INSTAGRAM", account.id, token);

  const subscribed = await subscribeToMessages(token);
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
