import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import type { ChannelType } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
export const AREA =
  "min-h-[132px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-blue";

export const ERRORS: Record<string, Text> = {
  bad_url: "admin.tutorials.channelGuidesEditor.enterAValidYoutube",
  not_found: "admin.tutorials.channelGuidesEditor.notFound",
};

export const BRANDS: Record<ChannelType, { Icon: Icon; color: string }> = {
  FACEBOOK: { Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { Icon: IconWorld, color: "var(--blue)" },
};
