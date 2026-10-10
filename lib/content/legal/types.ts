import type { Bilingual } from "../types";

export const LEGAL_REVIEW_NOTICE: Bilingual = {
  ka: "ეს დოკუმენტი მომზადებულია პროექტის ფარგლებში და საჭიროებს იურისტის განხილვას გამოქვეყნებამდე.",
  en: "This document was prepared as part of the project and requires review by a lawyer before publication.",
};

export type LegalSection = {
  heading: Bilingual;
  paragraphs?: Bilingual[];
  bullets?: Bilingual[];
};

export type LegalDoc = {
  slug: "terms" | "privacy" | "data-protection";
  title: Bilingual;
  description: Bilingual;
  updated: string;
  sections: LegalSection[];
};
