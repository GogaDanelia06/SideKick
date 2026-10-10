import { prisma } from "@/lib/db";
import type { SectionData } from "@/components/admin/sectionData";

export async function loadPlans(): Promise<SectionData> {
  return { kind: "plans", plans: await prisma.plan.findMany({ orderBy: { price: "asc" } }) };
}

export async function loadFaq(): Promise<SectionData> {
  return { kind: "faq", faqs: await prisma.siteFaq.findMany({ orderBy: { order: "asc" } }) };
}
