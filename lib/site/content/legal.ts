import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { LegalSectionView } from "@/lib/content/legalBlocks";
import { pairSection } from "@/lib/content/legalSections";
import type { Bilingual } from "@/lib/content/types";
import { legalTitleKey } from "@/lib/site/textKeys";

export type { LegalSectionView };

export async function getLegalSections(doc: string): Promise<LegalSectionView[]> {
  const rows = await prisma.legalSection.findMany({
    where: { doc, published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(pairSection);
}

export async function getLegalTitle(doc: string): Promise<Bilingual | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: legalTitleKey(doc) } });
  const ka = row?.valueKa.trim();
  return ka ? bilingual(ka, row?.valueEn.trim()) : null;
}
