import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import type { SocialNetwork } from "./contactDetails";
import type { IconType } from "./types";

export const SOCIAL_LABEL = {
  ka: "სოციალური ქსელები",
  en: "Social networks",
};

export const SOCIAL_NETWORKS: Record<SocialNetwork, { label: string; icon: IconType; hover: string }> = {
  facebook: { label: "Facebook", icon: IconBrandFacebook, hover: "hover:border-[#1877F2] hover:text-[#1877F2]" },
  instagram: { label: "Instagram", icon: IconBrandInstagram, hover: "hover:border-[#E4405F] hover:text-[#E4405F]" },
  whatsapp: { label: "WhatsApp", icon: IconBrandWhatsapp, hover: "hover:border-[#25D366] hover:text-[#25D366]" },
  linkedin: { label: "LinkedIn", icon: IconBrandLinkedin, hover: "hover:border-[#0A66C2] hover:text-[#0A66C2]" },
};
