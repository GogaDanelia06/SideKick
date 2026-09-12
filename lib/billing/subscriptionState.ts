/** Subscription expiry. There is no auto-renewal, so expiry is enforced when read. */

/** A lapsed subscription keeps working this long; bank transfers can take days. */
export const GRACE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function graceEndsAt(renewsAt: Date): Date {
  return new Date(renewsAt.getTime() + GRACE_DAYS * DAY_MS);
}

/**
 * True once the paid period and its grace period have both passed. No `renewsAt`
 * (trials, manual setups) never expires; the status is not consulted.
 */
export function isExpired(renewsAt: Date | null | undefined, now = new Date()): boolean {
  if (!renewsAt) return false;
  return graceEndsAt(renewsAt).getTime() < now.getTime();
}

/** True while the paid period is over but the grace period is not. */
export function inGrace(renewsAt: Date | null | undefined, now = new Date()): boolean {
  if (!renewsAt) return false;
  return renewsAt.getTime() < now.getTime() && !isExpired(renewsAt, now);
}
