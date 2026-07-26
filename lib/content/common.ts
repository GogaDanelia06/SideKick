import type { Bilingual } from "./types";

export const BRAND = "Sidekick";

export const ACTIONS = {
  tryFree: { ka: "ცადე უფასოდ", en: "Try it free" },
  learnMore: { ka: "გაიგე მეტი", en: "Learn more" },
  getStarted: { ka: "დაიწყე", en: "Get started" },
  profile: { ka: "პროფილი", en: "Profile" },
} satisfies Record<string, Bilingual>;

export const ONLINE_STATUS: Bilingual = {
  ka: "ონლაინ · პასუხობს წამებში",
  en: "online · replies in seconds",
};
