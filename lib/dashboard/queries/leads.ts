import { prisma } from "@/lib/db";

export function getLeads(businessId: string) {
  return prisma.lead.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
}
