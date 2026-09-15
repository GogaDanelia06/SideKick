export const DEFAULT_AI_LANGUAGE = "ქართული";

export const MAX_AI_LANGUAGES = 12;

/** One-click suggestions in the languages editor. */
export const SUGGESTED_LANGUAGES = ["ქართული", "English", "Русский", "Türkçe"];

export const LANGUAGE_FLAGS: Record<string, string> = {
  "ქართული": "🇬🇪",
  English: "🇬🇧",
  "Русский": "🇷🇺",
  "Türkçe": "🇹🇷",
  Deutsch: "🇩🇪",
};

/** Trimmed, de-duplicated language names; anything that is not a list yields none. */
export function cleanLanguages(languages: unknown): string[] {
  if (!Array.isArray(languages)) return [];
  return [...new Set(languages.map((language) => String(language).trim()).filter(Boolean))];
}
