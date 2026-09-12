import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { Bilingual } from "@/lib/content/types";
import { legalTitleKey } from "@/lib/site/textKeys";

export type LegalSectionView = {
  heading: Bilingual;
  paragraphs: Bilingual[];
  bullets: Bilingual[];
};

/** Pairs Georgian and English parts by index; English falls back to the Georgian. */
function pairParts(ka: string, en: string, separator: RegExp): Bilingual[] {
  const parts = (text: string) => text.split(separator).map((s) => s.trim()).filter(Boolean);
  const english = parts(en);
  return parts(ka).map((text, i) => ({ ka: text, en: english[i] ?? text }));
}

/** Published sections of a legal document; empty means the drafted copy in lib/content/legal.ts applies. */
export async function getLegalSections(doc: string): Promise<LegalSectionView[]> {
  const rows = await prisma.legalSection.findMany({ where: { doc, published: true }, orderBy: { order: "asc" } });
  return rows.map((r) => ({
    heading: bilingual(r.headingKa, r.headingEn),
    paragraphs: pairParts(r.bodyKa, r.bodyEn, /\n\s*\n/),
    bullets: pairParts(r.bulletsKa, r.bulletsEn, /\n/),
  }));
}

/** A legal document's admin-set heading, or null to use the drafted title. */
export async function getLegalTitle(doc: string): Promise<Bilingual | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: legalTitleKey(doc) } });
  const ka = row?.valueKa.trim();
  return ka ? bilingual(ka, row?.valueEn.trim()) : null;
}
