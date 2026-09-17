import type { Bilingual } from "@/lib/content/types";

/**
 * AI character options. AiConfig stores the Georgian label (`ka`) and the AI service
 * reads it as-is; `en` is only what the settings screen shows in English.
 */
export const AI_STYLES: Bilingual[] = [
  { ka: "მეგობრული", en: "Friendly" },
  { ka: "პროფესიონალური", en: "Professional" },
  { ka: "ოფიციალური", en: "Formal" },
  { ka: "გაყიდვებზე ორიენტირებული", en: "Sales-oriented" },
  { ka: "კონსულტანტის სტილი", en: "Consultative" },
];

export const AI_LENGTHS: Bilingual[] = [
  { ka: "მოკლე", en: "Short" },
  { ka: "საშუალო", en: "Medium" },
  { ka: "დეტალური", en: "Detailed" },
];

export const AI_EMOJI_LEVELS: Bilingual[] = [
  { ka: "არასოდეს", en: "Never" },
  { ka: "ზომიერად", en: "Moderately" },
  { ka: "ხშირად", en: "Often" },
];

export const AI_ADDRESS_FORMS: Bilingual[] = [
  { ka: "ფორმალური", en: "Formal" },
  { ka: "ფამილიარული", en: "Informal" },
];

/** The emoji level under which replies must contain no emoji at all. */
export const NO_EMOJI = "არასოდეს";

/** What a new business starts with, and what the settings screen shows when nothing is saved. */
export const AI_DEFAULTS = {
  style: "პროფესიონალური",
  length: "საშუალო",
  emoji: "ზომიერად",
  addressForm: "ფორმალური",
};
