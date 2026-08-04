import { prisma } from "@/lib/db";
import { EVENT_NAMES } from "./events";
import { log } from "@/lib/logger";

/**
 * The paths worth counting separately.
 *
 * `day_name_path` is unique, so an unrecognised path would earn its own row —
 * and `/api/track` is public, which makes that a way for anyone to grow the
 * table without limit. Everything off this list is folded into "other" instead,
 * which caps the row count at roughly (routes × events × days).
 *
 * Adding a page means adding it here, otherwise its visits land in "other".
 */
const KNOWN_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
  "/data-protection",
  "/start",
  "/login",
  "/register",
  "/forgot",
  "/reset",
  "/dashboard",
  "/dashboard/ai",
  "/dashboard/analytics",
  "/dashboard/billing",
  "/dashboard/billing/return",
  "/dashboard/channels",
  "/dashboard/conversations",
  "/dashboard/leads",
  "/dashboard/orders",
  "/dashboard/products",
  "/dashboard/profile",
  "/dashboard/team",
  "/dashboard/videos",
]);

/** Where anything unrecognised is counted. */
const OTHER = "other";

function normalisePath(raw: string): string {
  const path = raw.trim();
  if (!path) return "";
  if (!path.startsWith("/")) return OTHER;

  // Query strings and fragments describe one visit, not a different page.
  const clean = (path.split(/[?#]/)[0] ?? "").replace(/(.)\/+$/, "$1");
  return KNOWN_PATHS.has(clean) ? clean : OTHER;
}

function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Adds one to the counter for this event, on this page, today.
 *
 * Never throws: analytics failing must not break the page the visitor is
 * actually trying to read.
 */
export async function recordEvent(name: string, path = ""): Promise<void> {
  if (!EVENT_NAMES.includes(name)) return;

  const day = today();
  const key = normalisePath(path);

  try {
    await prisma.analyticsDaily.upsert({
      where: { day_name_path: { day, name, path: key } },
      create: { day, name, path: key, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch (err) {
    log.error("could not record analytics event", err, { name });
  }
}
