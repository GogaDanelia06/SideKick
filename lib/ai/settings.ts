import type { Bilingual } from "@/lib/content/types";

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

export const NO_EMOJI = "არასოდეს";

export const AI_DEFAULTS = {
  style: "პროფესიონალური",
  length: "საშუალო",
  emoji: "ზომიერად",
  addressForm: "ფორმალური",
};
