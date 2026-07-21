import type { Bilingual } from "@/lib/i18n/types";

export type Crumb = { label: Bilingual; href: string };

/** Home crumb shared by every interior page's trail. */
export const HOME_CRUMB: Crumb = { label: { ka: "მთავარი", en: "Home" }, href: "/" };
