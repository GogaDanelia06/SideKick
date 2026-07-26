import type { Bilingual } from "@/lib/i18n/types";

export type Crumb = { label: Bilingual; href: string };

export const HOME_CRUMB: Crumb = { label: { ka: "მთავარი", en: "Home" }, href: "/" };
