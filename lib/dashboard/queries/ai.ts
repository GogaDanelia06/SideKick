import { prisma } from "@/lib/db";

export async function getAiConfig(businessId: string) {
  const [config, faqs, business] = await Promise.all([
    prisma.aiConfig.findUnique({ where: { businessId } }),
    prisma.faq.findMany({ where: { businessId }, orderBy: { question: "asc" } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { config, faqs, business };
}
