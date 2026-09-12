import type { ChannelType } from "@prisma/client";

/**
 * Which Graph host a stored token belongs to. Instagram Login tokens (`IGA…`) only
 * work on graph.instagram.com and Page tokens (`EAA…`) only on graph.facebook.com.
 * One Instagram channel can hold either, so decide by token, never by channel type.
 */

export const GRAPH_FACEBOOK = "https://graph.facebook.com";
export const GRAPH_INSTAGRAM = "https://graph.instagram.com";

const INSTAGRAM_LOGIN_TOKEN = /^IGA/;

export const isInstagramLoginToken = (token: string) => INSTAGRAM_LOGIN_TOKEN.test(token);

export function graphHostFor(channelType: ChannelType, accessToken: string): string {
  if (channelType !== "INSTAGRAM") return GRAPH_FACEBOOK;
  return isInstagramLoginToken(accessToken) ? GRAPH_INSTAGRAM : GRAPH_FACEBOOK;
}
