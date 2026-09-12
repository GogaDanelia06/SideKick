import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Channel fields safe for client components (never the access token). */
export const CHANNEL_FIELDS = {
  id: true,
  type: true,
  status: true,
  connected: true,
  lastSyncAt: true,
} as const;

export type ChannelSummary = Prisma.ChannelGetPayload<{ select: typeof CHANNEL_FIELDS }> & {
  /** Both the account id and the token are stored. */
  linked: boolean;
};

export async function getChannels(businessId: string): Promise<ChannelSummary[]> {
  const rows = await prisma.channel.findMany({
    where: { businessId },
    // Read only to derive `linked`; neither value is returned.
    select: { ...CHANNEL_FIELDS, externalId: true, accessToken: true },
    orderBy: { type: "asc" },
  });

  return rows.map(({ externalId, accessToken, ...rest }) => ({
    ...rest,
    linked: Boolean(externalId && accessToken),
  }));
}
