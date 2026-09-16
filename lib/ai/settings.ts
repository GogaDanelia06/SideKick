// AI character options. AiConfig stores these Georgian labels, and the AI service reads them as-is.

export const AI_STYLES = ["მეგობრული", "პროფესიონალური", "ოფიციალური", "გაყიდვებზე ორიენტირებული", "კონსულტანტის სტილი"];

export const AI_LENGTHS = ["მოკლე", "საშუალო", "დეტალური"];

export const AI_EMOJI_LEVELS = ["არასოდეს", "ზომიერად", "ხშირად"];

export const AI_ADDRESS_FORMS = ["ფორმალური", "ფამილიარული"];

/** The emoji level under which replies must contain no emoji at all. */
export const NO_EMOJI = "არასოდეს";

/** What a new business starts with, and what the settings screen shows when nothing is saved. */
export const AI_DEFAULTS = {
  style: "პროფესიონალური",
  length: "საშუალო",
  emoji: "ზომიერად",
  addressForm: "ფორმალური",
};
