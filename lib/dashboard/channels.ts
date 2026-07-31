import type { ChannelType } from "@prisma/client";

/** Display names for the channel enum. Typed as a full Record so adding a
 *  channel to the schema fails the build here until it is named. */
export const CHANNEL_NAMES: Record<ChannelType, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  WEBSITE: "API for websites",
};

/** Every channel type, in the order they are shown. Derived from the names
 *  above so the two can never disagree. */
export const CHANNEL_TYPES = Object.keys(CHANNEL_NAMES) as ChannelType[];
