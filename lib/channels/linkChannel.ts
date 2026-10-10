import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { checkLimit } from "@/lib/billing/limits";
import type { ChannelType } from "@prisma/client";

export type LinkResult = { ok: true } | { ok: false; reason: "limit" | "already_linked" };

export async function linkChannel(
  businessId: string,
  type: ChannelType,
  externalId: string,
  accessToken: string,
  tokenExpiresAt: Date | null = null,
): Promise<LinkResult> {
  const existing = await prisma.channel.findFirst({
    where: { businessId, type },
    select: { id: true, connected: true },
  });

  if (!existing?.connected) {
    const verdict = await checkLimit(businessId, "channels");
    if (!verdict.allowed) return { ok: false, reason: "limit" };
  }

  const live = {
    externalId,
    accessToken,
    tokenExpiresAt,
    connected: true,
    status: "ACTIVE" as const,
    lastSyncAt: new Date(),
  };

  try {
    if (existing) {
      await prisma.channel.update({ where: { id: existing.id }, data: live });
    } else {
      await prisma.channel.create({ data: { businessId, type, ...live } });
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      log.warn("channel account is already linked to another business", { type, externalId });
      return { ok: false, reason: "already_linked" };
    }
    throw err;
  }
}
