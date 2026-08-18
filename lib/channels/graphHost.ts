import type { ChannelType } from "@prisma/client";

/**
 * Which Graph host a stored credential belongs to.
 *
 * There are two roads to the same Instagram inbox and they are separate APIs.
 * **Instagram Login** hands back an `IGA…` token that only works against
 * graph.instagram.com. The **Messenger Platform** hands back the Page's `EAA…`
 * token, which only works against graph.facebook.com. Crossing them fails with
 * "object does not exist".
 *
 * So the host is decided by the *token*, never by the channel being Instagram —
 * the same channel row holds either one depending on which consent screen the
 * merchant went through. Deciding by channel type is the bug this module exists
 * to prevent: it was fixed once for sending replies and then reappeared in the
 * customer-name lookup, where a Page token was being pointed at
 * graph.instagram.com and every Instagram chat stayed nameless.
 */

export const GRAPH_FACEBOOK = "https://graph.facebook.com";
export const GRAPH_INSTAGRAM = "https://graph.instagram.com";

/** Instagram Login mints tokens with this prefix; a Page token starts `EAA`. */
const INSTAGRAM_LOGIN_TOKEN = /^IGA/;

export const isInstagramLoginToken = (token: string) => INSTAGRAM_LOGIN_TOKEN.test(token);

export function graphHostFor(channelType: ChannelType, accessToken: string): string {
  if (channelType !== "INSTAGRAM") return GRAPH_FACEBOOK;
  return isInstagramLoginToken(accessToken) ? GRAPH_INSTAGRAM : GRAPH_FACEBOOK;
}
