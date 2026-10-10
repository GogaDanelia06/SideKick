import type { Text } from "@/lib/i18n/messages";
import { STORY, CTA, FREE_PERIOD } from "./landingGroups";
import { ABOUT, CONTACT, PRICING, CONTACT_HEADING } from "./pageGroups";
import { ka, type TextGroup } from "./types";

export const TEXT_GROUPS: TextGroup[] = [
  STORY,
  CTA,
  FREE_PERIOD,
  ABOUT,
  CONTACT,
  PRICING,
  CONTACT_HEADING,
];

export type LegalDocMeta = { doc: string; title: Text; route: string };

export function legalTitleKey(doc: string): string {
  return `legal_${doc}_title`;
}

export const LEGAL_DOCS: LegalDocMeta[] = [
  { doc: "terms", title: ka("წესები და პირობები", "Terms & conditions"), route: "/terms" },
  { doc: "privacy", title: ka("კონფიდენციალურობა", "Privacy policy"), route: "/privacy" },
  {
    doc: "data-protection",
    title: ka("პერსონალურ მონაცემთა დაცვა", "Personal data protection"),
    route: "/data-protection",
  },
];

export function findLegalDoc(doc: string): LegalDocMeta | undefined {
  return LEGAL_DOCS.find((d) => d.doc === doc);
}

export function findGroup(slug: string): TextGroup | undefined {
  return TEXT_GROUPS.find((g) => g.slug === slug);
}

export type { TextField, TextGroup } from "./types";
