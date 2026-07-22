import type { Bilingual } from "@/lib/content/types";

/** Date ranges offered on the analytics screen. Index maps to RANGE_DAYS in
 *  app/dashboard/analytics/page.tsx — all figures are computed from the
 *  database for the selected window. */
export const RANGES: Bilingual[] = [
  { ka: "1 კვირა", en: "1 week" },
  { ka: "1 თვე", en: "1 month" },
  { ka: "3 თვე", en: "3 months" },
  { ka: "6 თვე", en: "6 months" },
  { ka: "1 წელი", en: "1 year" },
];
