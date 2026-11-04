import { prisma } from "@/lib/db";
import { openToken } from "@/lib/security/tokenCipher";
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
    rows.map(async (c) => {
      const token = openToken(c.accessToken);
      return [c.id, c.externalId && token ? await fetchAccountProfile(c.type, c.externalId, token) : null];
    }),
  );
  return Object.fromEntries(entries);
}
