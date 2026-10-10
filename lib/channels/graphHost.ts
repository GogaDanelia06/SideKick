import type { ChannelType } from "@prisma/client";

export const GRAPH_FACEBOOK = "https://graph.facebook.com";
export const GRAPH_INSTAGRAM = "https://graph.instagram.com";

const INSTAGRAM_LOGIN_TOKEN = /^IGA/;

export const isInstagramLoginToken = (token: string) => INSTAGRAM_LOGIN_TOKEN.test(token);

export function graphHostFor(channelType: ChannelType, accessToken: string): string {
  if (channelType !== "INSTAGRAM") return GRAPH_FACEBOOK;
  return isInstagramLoginToken(accessToken) ? GRAPH_INSTAGRAM : GRAPH_FACEBOOK;
}
