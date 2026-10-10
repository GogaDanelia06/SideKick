import { prisma } from "@/lib/db";

export async function getBusinessesForAdmin() {
  const rows = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      subscription: {
        select: {
          status: true,
          msgUsed: true,
          renewsAt: true,
          plan: { select: { id: true, key: true, name: true, msgLimit: true } },
        },
      },
      _count: { select: { memberships: true, conversations: true, products: true } },
      channels: { where: { connected: true }, select: { id: true } },
    },
  });

  return rows.map(({ channels, ...rest }) => ({ ...rest, channelsOn: channels.length }));
}

export type AdminBusiness = Awaited<ReturnType<typeof getBusinessesForAdmin>>[number];

export function getPlansForAdmin() {
  return prisma.plan.findMany({
    orderBy: { price: "asc" },
    select: { id: true, key: true, name: true, nameEn: true, price: true, msgLimit: true, channelCap: true },
  });
}

export type AdminPlan = Awaited<ReturnType<typeof getPlansForAdmin>>[number];
