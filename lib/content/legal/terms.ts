import type { LegalDoc } from "./types";
import { TERMS_PART_ONE } from "./termsPartOne";
import { TERMS_PART_TWO } from "./termsPartTwo";

export const TERMS: LegalDoc = {
  slug: "terms",
  title: { ka: "წესები და პირობები", en: "Terms and Conditions" },
  description: {
    ka: "Sidekick-ის მომსახურებით სარგებლობის წესები და პირობები — ანგარიში, პაკეტები, გადახდა, პასუხისმგებლობა.",
    en: "Terms and conditions for using the Sidekick service — accounts, plans, payment and liability.",
  },
  updated: "2026-07-22",
  sections: [...TERMS_PART_ONE, ...TERMS_PART_TWO],
};
