import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { FaqItem } from "@/lib/content/faq";

export async function getSiteFaq(): Promise<FaqItem[]> {
  const rows = await prisma.siteFaq.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map((r) => ({
    question: bilingual(r.questionKa, r.questionEn),
    answer: bilingual(r.answerKa, r.answerEn),
  }));
}
