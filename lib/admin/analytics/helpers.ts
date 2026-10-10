import type { SubscriptionStatus } from "@prisma/client";

export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function countByStatus(
  rows: { status: SubscriptionStatus; _count: number }[],
  status: SubscriptionStatus,
): number {
  return rows.find((r) => r.status === status)?._count ?? 0;
}

export function signupsByMonth(rows: { createdAt: Date }[], windowStart: Date): { month: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(windowStart);
    d.setUTCMonth(d.getUTCMonth() + i);
    buckets.set(d.toISOString().slice(0, 7), 0);
  }
  for (const b of rows) {
    const key = b.createdAt.toISOString().slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([month, count]) => ({ month, count }));
}
