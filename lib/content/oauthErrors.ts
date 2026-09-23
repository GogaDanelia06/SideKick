import type { Bilingual } from "./types";

/** What the login page says when a Google sign-in comes back with `?error=`. */
const OAUTH_ERRORS: Record<string, Bilingual> = {
  OAuthAccountNotLinked: {
    ka: "ეს ელფოსტა უკვე რეგისტრირებულია პაროლით. შედი პაროლით.",
    en: "That address is already registered with a password. Sign in with your password.",
  },
  AccessDenied: {
    ka: "Google-ით შესვლა არ დაასრულე.",
    en: "The Google sign-in was not completed.",
  },
  Configuration: {
    ka: "Google-ით შესვლა ჯერ არ არის გამართული.",
    en: "Google sign-in is not configured yet.",
  },
};

const OAUTH_FAILED: Bilingual = {
  ka: "Google-ით შესვლა ვერ მოხერხდა. სცადე პაროლით.",
  en: "Google sign-in failed. Try your password instead.",
};

export const oauthErrorMessage = (key: string | null): Bilingual | null => (key ? (OAUTH_ERRORS[key] ?? OAUTH_FAILED) : null);
