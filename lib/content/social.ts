import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "./types";

export type Social = { icon: IconType; label: string; href: string };

export const SOCIAL_LABEL: Bilingual = {
  ka: "სოციალური ქსელები",
  en: "Social networks",
};

export const SOCIALS: Social[] = [
  { icon: IconBrandFacebook, label: "Facebook", href: "#" },
  { icon: IconBrandInstagram, label: "Instagram", href: "#" },
  { icon: IconBrandWhatsapp, label: "WhatsApp", href: "#" },
  { icon: IconBrandLinkedin, label: "LinkedIn", href: "#" },
];
