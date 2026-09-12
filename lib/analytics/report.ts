import { prisma } from "@/lib/db";
import { TRACKED_EVENTS, type TrackedEvent } from "./events";

export type EventTotals = {
  event: TrackedEvent;
  last30: number;
  last7: number;
};

export type PageTotals = { path: string; views: number };

/** One step of the sign-up funnel, with how many of the previous step got here. */
export type FunnelStep = { event: TrackedEvent; count: number; ofPrevious: number | null };

export type TrafficReport = {
  events: EventTotals[];
  /** Marketing pages — what the public actually sees. */
  publicPages: PageTotals[];
  /** Pages behind the login, kept apart so they can't flatter the traffic. */
  appPages: PageTotals[];
  totalViews: number;
  /** Page views per day, oldest first — a 30-day line. */
  daily: { day: string; views: number }[];
  funnel: FunnelStep[];
  /** True until anything has ever been recorded. */
  empty: boolean;
};

/** Anything under here is someone using the product, not visiting the site. */
const APP_PREFIXES = ["/dashboard", "/login", "/register", "/forgot", "/reset", "/start"];

function isAppPath(path: string): boolean {
  return APP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Traffic for the admin panel, read from the daily counters. */
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
  const ranked = [...byPath.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views);

  const publicPages = ranked.filter((p) => !isAppPath(p.path)).slice(0, 8);
  const appPages = ranked.filter((p) => isAppPath(p.path)).slice(0, 8);

  // Each step's rate is against the step before it, which shows where people drop off.
  const funnelNames = ["registration_started", "registration_completed", "pricing_plan_selected"];
  const funnel: FunnelStep[] = [];
  for (const name of funnelNames) {
    const entry = events.find((e) => e.event.name === name);
    if (!entry) continue;
    const previous = funnel.at(-1);
    funnel.push({
      event: entry.event,
      count: entry.last30,
      ofPrevious:
        previous && previous.count > 0 ? Math.round((entry.last30 / previous.count) * 100) : null,
    });
  }

  // Include empty days, so gaps read as no traffic rather than missing data.
  const perDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) perDay.set(daysAgo(i).toISOString().slice(0, 10), 0);
  for (const r of rows) {
    if (r.name !== "page_view") continue;
    const key = r.day.toISOString().slice(0, 10);
    if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + r.count);
  }

  return {
    events,
    publicPages,
    appPages,
    totalViews: sum((r) => r.name === "page_view"),
    daily: [...perDay.entries()].map(([day, views]) => ({ day, views })),
    funnel,
    empty: rows.length === 0,
  };
}
