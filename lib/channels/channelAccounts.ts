import { prisma } from "@/lib/db";
import { fetchAccountProfile, type AccountProfile } from "./accountProfile";

export type ChannelAccounts = Record<string, AccountProfile | null>;

export async function getChannelAccounts(businessId: string): Promise<ChannelAccounts> {
  const rows = await prisma.channel.findMany({
    where: {
      businessId,
      type: { in: ["FACEBOOK", "INSTAGRAM"] },
      externalId: { not: null },
      accessToken: { not: null },
    },
    select: { id: true, type: true, externalId: true, accessToken: true },
  });

  const entries = await Promise.all(
    rows.map(async (c) => [
      c.id,
      c.externalId && c.accessToken ? await fetchAccountProfile(c.type, c.externalId, c.accessToken) : null,
    ]),
  );
  return Object.fromEntries(entries);
}
