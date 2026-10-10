import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";

export type BoxView = { icon: string; title: Bilingual; body: Bilingual };

export async function getBenefits(): Promise<BoxView[]> {
  const rows = await prisma.benefit.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((b) => ({
    icon: b.icon,
    title: { ka: b.titleKa, en: b.titleEn || b.titleKa },
    body: { ka: b.descKa, en: b.descEn || b.descKa },
  }));
}

export async function getServiceBoxes(): Promise<BoxView[]> {
  const rows = await prisma.serviceBox.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((s) => ({
    icon: s.icon,
    title: { ka: s.titleKa, en: s.titleEn || s.titleKa },
    body: { ka: s.bodyKa, en: s.bodyEn || s.bodyKa },
  }));
}
