import { prisma } from "@/lib/db";
import { EVENT_NAMES } from "./events";
import { log } from "@/lib/logger";

/** Paths counted separately; anything else is folded into "other" to bound the table size. */
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

/** Increments today's counter for an event and page. Never throws. */
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
