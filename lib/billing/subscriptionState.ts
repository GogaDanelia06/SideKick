/**
 * Whether a subscription still entitles a tenant to the service.
 *
 * `renewsAt` was written by every payment and shown on the billing page, but
 * nothing ever read it back — so a tenant who paid for one month kept their
 * plan forever. There is no auto-renewal in this product (see HANDOVER §7a);
 * a customer renews by paying again, which means expiry has to be enforced on
 * read or it is not enforced at all.
 */

/**
 * How long a lapsed subscription keeps working.
 *
 * A bank transfer that clears on Monday for a Friday renewal is the ordinary
 * case, not an edge one, and cutting a merchant's assistant off over a weekend
 * costs them customers rather than teaching them to pay. Long enough to cover
 * that; short enough that it is not a free extra week.
 */
export const GRACE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When the grace period runs out for a period ending at `renewsAt`. */
export function graceEndsAt(renewsAt: Date): Date {
  return new Date(renewsAt.getTime() + GRACE_DAYS * DAY_MS);
}

/**
 * True once the paid period *and* its grace period are both behind us.
 *
 * A subscription with no `renewsAt` is never expired. That is the state of
 * every trial and of anything seeded by hand, and treating "was never bought"
 * as "has run out" would switch off tenants who never had a period to run out
 * of — including, on the day this ships, all of them.
 *
 * The status is deliberately not consulted. A cancelled subscription keeps what
 * it paid for until the same date, which is what the billing screen already
 * promises, and a `PAST_DUE` row is expired for exactly the same reason as an
 * `ACTIVE` one whose date has passed: the money stopped.
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
