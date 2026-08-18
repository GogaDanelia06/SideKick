import { prisma } from "@/lib/db";

/**
 * Every tenant, with the plan they are on and what they are using it for.
 *
 * Platform-admin only. It exists because plans are assigned by hand until the
 * banks are wired up, and assigning one blind — without seeing how many
 * messages a shop actually sends, or how many channels it has on — is how a
 * tenant ends up on a tier that cannot hold them.
 */
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
      // Only the ones that are on, because that is what the plan's channel cap
      // counts — a provisioned-but-off row is not using anything.
      channels: { where: { connected: true }, select: { id: true } },
    },
  });

  return rows.map(({ channels, ...rest }) => ({ ...rest, channelsOn: channels.length }));
}

export type AdminBusiness = Awaited<ReturnType<typeof getBusinessesForAdmin>>[number];

/** The plans a business can be put on, cheapest first. */
export function getPlansForAdmin() {
  return prisma.plan.findMany({
    orderBy: { price: "asc" },
    select: { id: true, key: true, name: true, price: true, msgLimit: true, channelCap: true },
  });
}

export type AdminPlan = Awaited<ReturnType<typeof getPlansForAdmin>>[number];
