import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";
import type { FaqItem } from "@/lib/content/faq";

export async function getSiteFaq(): Promise<FaqItem[]> {
  const rows = await prisma.siteFaq.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    question: { ka: r.questionKa, en: r.questionEn },
    answer: { ka: r.answerKa, en: r.answerEn },
  }));
}

export async function getSiteTexts(keys: string[]): Promise<Record<string, Bilingual>> {
  if (keys.length === 0) return {};
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const out: Record<string, Bilingual> = {};
  for (const r of rows) {
    const ka = r.valueKa.trim();
    if (!ka) continue;
    out[r.key] = { ka, en: r.valueEn.trim() || ka };
  }
  return out;
}

export async function getSiteValue(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.valueKa.trim() || null;
}
