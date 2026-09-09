import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { checkLimit } from "@/lib/billing/limits";
import type { ChannelType } from "@prisma/client";

export type LinkResult = { ok: true } | { ok: false; reason: "limit" | "already_linked" };

/**
 * Writes a credential onto the tenant's existing channel row.
 *
 * Shared by both connect flows, and deliberately so: Facebook Login and
 * Instagram Login produce completely different tokens, but what happens to the
 * result is identical, and two copies of this drifted apart once already.
 *
 * Updates rather than creates, because every business is provisioned with a row
 * per channel. Creating a second one would leave the dashboard toggling a
 * different row from the one the webhook reads — which looks exactly like a
 * connection that silently does nothing.
 */
export async function linkChannel(
  businessId: string,
  type: ChannelType,
  externalId: string,
  accessToken: string,
  /** When the credential dies, for providers that say so. Facebook's does not. */
  tokenExpiresAt: Date | null = null,
): Promise<LinkResult> {
  const existing = await prisma.channel.findFirst({
    where: { businessId, type },
    select: { id: true, connected: true },
  });

  // The plan's channel cap, but only for a channel that is not already on.
  // Counting unconditionally would make "Reconnect" fail forever for any tenant
  // sitting at their ceiling — which is every tenant on the single-channel
  // plans this product sells, and reconnecting is exactly what they need to do
  // when a token expires.
  if (!existing?.connected) {
    const verdict = await checkLimit(businessId, "channels");
    if (!verdict.allowed) return { ok: false, reason: "limit" };
  }

  // All four fields, because two screens read two different ones. The channels
  // page asks `connected`; the overview card asks `status`. Writing only the
  // first left a channel that had just finished Meta's consent screen reading
  // "connected" on one page and "off" on the other — and `lastSyncAt` stayed
  // blank, so the row also claimed it had never synced.
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
    // `type_externalId` is unique across the whole table, not per business, so
    // an account already linked to another tenant lands here. Uncaught it threw
    // out of the OAuth callback as a 500 — a blank error page at the end of a
    // consent flow, with nothing to tell the merchant what to do.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      log.warn("channel account is already linked to another business", { type, externalId });
      return { ok: false, reason: "already_linked" };
    }
    throw err;
  }
}
