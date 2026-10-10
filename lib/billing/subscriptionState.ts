export const GRACE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function graceEndsAt(renewsAt: Date): Date {
  return new Date(renewsAt.getTime() + GRACE_DAYS * DAY_MS);
}

export function isExpired(renewsAt: Date | null | undefined, now = new Date()): boolean {
  if (!renewsAt) return false;
  return graceEndsAt(renewsAt).getTime() < now.getTime();
}

