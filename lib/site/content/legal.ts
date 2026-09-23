import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import { pairBlocks, pairItems, type LegalSectionView } from "@/lib/content/legalBlocks";
import type { Bilingual } from "@/lib/content/types";
import { legalTitleKey } from "@/lib/site/textKeys";

export type { LegalSectionView };

/** Published sections of a legal document; empty means the drafted copy in lib/content/legal.ts applies. */
export async function getLegalSections(doc: string): Promise<LegalSectionView[]> {
  const rows = await prisma.legalSection.findMany({
    where: { doc, published: true },
    orderBy: { order: "asc" },
  });

  return rows.map((r) => ({
    heading: bilingual(r.headingKa, r.headingEn),
    // The bullets box, where a section still uses it, is a list after the text.
    blocks: [...pairBlocks(r.bodyKa, r.bodyEn), ...pairItems(r.bulletsKa, r.bulletsEn)],
  }));
}

/** A legal document's admin-set heading, or null to use the drafted title. */
export async function getLegalTitle(doc: string): Promise<Bilingual | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: legalTitleKey(doc) } });
  const ka = row?.valueKa.trim();
  return ka ? bilingual(ka, row?.valueEn.trim()) : null;
}
