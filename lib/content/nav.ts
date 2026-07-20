import { ROUTES, type RoutePath } from "@/lib/routes";
import type { Bilingual } from "./types";

export type NavItem = { href: RoutePath; label: Bilingual };

/** Primary header navigation. */
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.about, label: { ka: "ჩვენ შესახებ", en: "About us" } },
  { href: ROUTES.pricing, label: { ka: "ფასები", en: "Pricing" } },
  { href: ROUTES.contact, label: { ka: "კონტაქტი", en: "Contact" } },
];
