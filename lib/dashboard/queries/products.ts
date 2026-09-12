import { prisma } from "@/lib/db";

export function getProducts(businessId: string) {
  return prisma.product.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
}
