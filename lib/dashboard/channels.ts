import type { ChannelType } from "@prisma/client";

export const CHANNEL_NAMES: Record<ChannelType, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  WEBSITE: "API for websites",
};

export const CHANNEL_TYPES = Object.keys(CHANNEL_NAMES) as ChannelType[];
