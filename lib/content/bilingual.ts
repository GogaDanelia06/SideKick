import type { Bilingual } from "./types";

export function bilingual(ka: string, en: string | null | undefined): Bilingual {
  return { ka, en: en || ka };
}
