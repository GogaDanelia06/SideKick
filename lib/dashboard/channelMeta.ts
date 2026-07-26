import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconWorld,
} from "@tabler/icons-react";
import type { ChannelType } from "@prisma/client";
import type { IconType } from "@/lib/content/types";

export const CHANNEL_META: Record<ChannelType, { name: string; icon: IconType; color: string }> = {
  FACEBOOK: { name: "Facebook", icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "Instagram", icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "WhatsApp", icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "Website", icon: IconWorld, color: "#58a6ff" },
};

export const CHANNEL_ORDER: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];
