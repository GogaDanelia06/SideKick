import { prisma } from "@/lib/db";
import { TRACKED_EVENTS, type TrackedEvent } from "./events";

export type EventTotals = {
  event: TrackedEvent;
  last30: number;
  last7: number;
};

export type PageTotals = { path: string; views: number };

export type TrafficReport = {
  events: EventTotals[];
  /** Busiest pages over the last 30 days. */
  topPages: PageTotals[];
  /** Page views per day, oldest first — a 30-day line. */
  daily: { day: string; views: number }[];
  /** True until anything has ever been recorded. */
  empty: boolean;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/**
 * What the admin panel shows for traffic.
 *
 * Reads the daily counters rather than raw hits, so this stays one small query
 * no matter how busy the site gets.
 */
export async function getTrafficReport(): Promise<TrafficReport> {
  const from30 = daysAgo(29);
  const from7 = daysAgo(6);

  const rows = await prisma.analyticsDaily.findMany({
    where: { day: { gte: from30 } },
    select: { day: true, name: true, path: true, count: true },
  });

  const sum = (predicate: (r: (typeof rows)[number]) => boolean) =>
    rows.filter(predicate).reduce((n, r) => n + r.count, 0);

  const events: EventTotals[] = TRACKED_EVENTS.map((event) => ({
    event,
    last30: sum((r) => r.name === event.name),
    last7: sum((r) => r.name === event.name && r.day >= from7),
  }));

  // Only page_view rows carry a meaningful path.
  const byPath = new Map<string, number>();
  for (const r of rows) {
    if (r.name !== "page_view" || !r.path) continue;
    byPath.set(r.path, (byPath.get(r.path) ?? 0) + r.count);
  }
  const topPages = [...byPath.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Every day in the window, including the quiet ones — gaps in a chart read
  // as missing data rather than as no traffic.
  const perDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) perDay.set(daysAgo(i).toISOString().slice(0, 10), 0);
  for (const r of rows) {
    if (r.name !== "page_view") continue;
    const key = r.day.toISOString().slice(0, 10);
    if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + r.count);
  }

  return {
    events,
    topPages,
    daily: [...perDay.entries()].map(([day, views]) => ({ day, views })),
    empty: rows.length === 0,
  };
}
