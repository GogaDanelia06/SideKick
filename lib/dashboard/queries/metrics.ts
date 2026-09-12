/** Orders that count toward revenue. */
export const COUNTED_ORDER = { not: "CANCELLED" } as const;

/** A figure with its change against the previous period; null when there is no baseline. */
export function metric(current: number, previous: number) {
  const deltaPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
  return { value: current, deltaPct };
}

export function minutesSince(date: Date, now: number): number {
  return Math.max(0, Math.round((now - date.getTime()) / 60000));
}
