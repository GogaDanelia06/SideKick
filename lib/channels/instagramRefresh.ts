import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { refreshLongLived } from "./instagramToken";

/**
 * Renews 60-day Instagram Login tokens before they expire. An expired token fails
 * silently (replies are refused while the channel still looks connected), and only
 * a token that still works can be renewed.
 */

const RENEW_WITHIN_DAYS = 15;

/** Meta refuses to renew a token younger than a day. */
const MIN_AGE_HOURS = 24;

const DAY_MS = 24 * 60 * 60 * 1000;

export type RefreshReport = {
  considered: number;
  renewed: number;
  failed: number;
};

function dueBefore(now: Date): Date {
  return new Date(now.getTime() + RENEW_WITHIN_DAYS * DAY_MS);
}

export async function refreshInstagramTokens(now = new Date()): Promise<RefreshReport> {
  const due = await prisma.channel.findMany({
    where: {
      type: "INSTAGRAM",
      connected: true,
      accessToken: { not: null },
      tokenExpiresAt: { not: null, lte: dueBefore(now), gt: now },
    },
    select: { id: true, businessId: true, accessToken: true, tokenExpiresAt: true, lastSyncAt: true },
  });

  const report: RefreshReport = { considered: due.length, renewed: 0, failed: 0 };

  for (const channel of due) {
    // `lastSyncAt` is when the current token was issued.
    const age = channel.lastSyncAt ? now.getTime() - channel.lastSyncAt.getTime() : Infinity;
    if (age < MIN_AGE_HOURS * 60 * 60 * 1000) continue;

    const fresh = await refreshLongLived(channel.accessToken!);
    if (!fresh) {
      report.failed += 1;
      log.error("Instagram token could not be renewed — this channel will stop", undefined, {
        businessId: channel.businessId,
        expiresAt: channel.tokenExpiresAt?.toISOString(),
      });
      continue;
    }

    await prisma.channel.update({
      where: { id: channel.id },
      data: { accessToken: fresh.token, tokenExpiresAt: fresh.expiresAt, lastSyncAt: now },
    });
    report.renewed += 1;
    log.info("Instagram token renewed", {
      businessId: channel.businessId,
      expiresAt: fresh.expiresAt?.toISOString(),
    });
  }

  return report;
}
