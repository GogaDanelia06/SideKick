export const DEFAULT_AI_LANGUAGE = "ქართული";

export const MAX_AI_LANGUAGES = 12;

export const SUGGESTED_LANGUAGES = ["ქართული", "English", "Русский", "Türkçe"];

export const LANGUAGE_FLAGS: Record<string, string> = {
  "ქართული": "🇬🇪",
  English: "🇬🇧",
  "Русский": "🇷🇺",
  "Türkçe": "🇹🇷",
  Deutsch: "🇩🇪",
};

export function cleanLanguages(languages: unknown): string[] {
  if (!Array.isArray(languages)) return [];
  return [...new Set(languages.map((language) => String(language).trim()).filter(Boolean))];
}
