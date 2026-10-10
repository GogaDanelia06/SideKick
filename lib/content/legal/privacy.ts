import type { LegalDoc } from "./types";
import { PRIVACY_PART_ONE } from "./privacyPartOne";
import { PRIVACY_PART_TWO } from "./privacyPartTwo";

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: { ka: "კონფიდენციალურობის პოლიტიკა", en: "Privacy Policy" },
  description: {
    ka: "როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ პერსონალურ მონაცემებს Sidekick-ის გამოყენებისას.",
    en: "How we collect, use and protect personal data when you use Sidekick.",
  },
  updated: "2026-07-22",
  sections: [...PRIVACY_PART_ONE, ...PRIVACY_PART_TWO],
};
