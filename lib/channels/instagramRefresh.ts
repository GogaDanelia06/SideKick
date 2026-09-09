import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { refreshLongLived } from "./instagramToken";

/**
 * Renews Instagram tokens before they lapse.
 *
 * Instagram Login issues sixty-day tokens and renews none of them. What makes
 * that dangerous is the shape of the failure: an expired token does not
 * disconnect the channel or raise anything. The row still says "connected", the
 * webhook still arrives, and every reply is refused — which is the same silence
 * that a wrong account id or a missing subscription produces, and takes just as
 * long to tell apart. Left alone, every connected account breaks on a two-month
 * timer, one at a time, long after anyone remembers connecting it.
 *
 * Renewing is only possible *while the token still works*. Once it lapses the
 * only way back is walking the merchant through the consent screen again, so
 * this runs well ahead of the deadline rather than at it.
 */

/** Renew once a token is inside this many days of expiry. */
const RENEW_WITHIN_DAYS = 15;

/** Meta refuses to renew a token younger than a day. */
const MIN_AGE_HOURS = 24;

const DAY_MS = 24 * 60 * 60 * 1000;

export type RefreshReport = {
  considered: number;
  renewed: number;
  failed: number;
};

/**
 * Which channels are worth a call right now.
 *
 * Only Instagram, only connected, only ones we hold a token and a date for. A
 * row with no `tokenExpiresAt` predates this column; it is left alone rather
 * than renewed blindly, because a refresh on a token Meta considers too young
 * fails and would repeat every night.
 */
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
    // Meta refuses anything younger than a day, and `lastSyncAt` is when this
    // token was obtained. Skipping quietly beats a nightly failure that reads
    // like a broken integration.
    const age = channel.lastSyncAt ? now.getTime() - channel.lastSyncAt.getTime() : Infinity;
    if (age < MIN_AGE_HOURS * 60 * 60 * 1000) continue;

    const fresh = await refreshLongLived(channel.accessToken!);
    if (!fresh) {
      report.failed += 1;
      // Error, not warning: nobody is watching this job, and the window to fix
      // it by hand closes when the token does.
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
