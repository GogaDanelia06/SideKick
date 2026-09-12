import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { checkLimit } from "@/lib/billing/limits";
import type { ChannelType } from "@prisma/client";

export type LinkResult = { ok: true } | { ok: false; reason: "limit" | "already_linked" };

/**
 * Stores a credential on the business's existing channel row (every business has
 * one row per channel type). Shared by the Facebook and Instagram connect flows.
 */
export async function linkChannel(
  businessId: string,
  type: ChannelType,
  externalId: string,
  accessToken: string,
  /** Null when the provider gives no expiry (Facebook Page tokens). */
  tokenExpiresAt: Date | null = null,
): Promise<LinkResult> {
  const existing = await prisma.channel.findFirst({
    where: { businessId, type },
    select: { id: true, connected: true },
  });

  // Only a new connection counts toward the plan's cap, so reconnecting always works.
  if (!existing?.connected) {
    const verdict = await checkLimit(businessId, "channels");
    if (!verdict.allowed) return { ok: false, reason: "limit" };
  }

  // The channels page reads `connected` and the overview reads `status`: set both.
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
    // `type_externalId` is unique across businesses: the account belongs to another one.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      log.warn("channel account is already linked to another business", { type, externalId });
      return { ok: false, reason: "already_linked" };
    }
    throw err;
  }
}
