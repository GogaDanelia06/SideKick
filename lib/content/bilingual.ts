import type { Bilingual } from "./types";

/** A bilingual value whose English falls back to the Georgian. */
export function bilingual(ka: string, en: string | null | undefined): Bilingual {
  return { ka, en: en || ka };
}
