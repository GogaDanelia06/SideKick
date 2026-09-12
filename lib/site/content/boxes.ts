import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { Bilingual } from "@/lib/content/types";

export type BoxView = { icon: string; title: Bilingual; body: Bilingual };

/** Published landing-page benefit boxes, in order. */
export async function getBenefits(): Promise<BoxView[]> {
  const rows = await prisma.benefit.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((b) => ({
    icon: b.icon,
    title: bilingual(b.titleKa, b.titleEn),
    body: bilingual(b.descKa, b.descEn),
  }));
}

/** Published pricing-page service boxes, in order. */
export async function getServiceBoxes(): Promise<BoxView[]> {
  const rows = await prisma.serviceBox.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((s) => ({
    icon: s.icon,
    title: bilingual(s.titleKa, s.titleEn),
    body: bilingual(s.bodyKa, s.bodyEn),
  }));
}
