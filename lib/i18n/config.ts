import type { Locale } from "./types";

/** Locale metadata rendered by the language switcher. */
export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "ka", label: "ქართული", short: "GEO" },
  { code: "en", label: "English", short: "ENG" },
];

export const DEFAULT_LOCALE: Locale = "ka";
export const LOCALE_STORAGE_KEY = "sidekick.locale";
