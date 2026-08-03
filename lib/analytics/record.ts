import { prisma } from "@/lib/db";
import { EVENT_NAMES } from "./events";
import { log } from "@/lib/logger";

/** Paths worth counting separately. Anything else is folded into "other" so a
 *  crawler hitting random URLs can't create a row per made-up path. */
const MAX_PATH = 60;

function normalisePath(raw: string): string {
  const path = raw.trim();
  if (!path.startsWith("/")) return "";
  // Query strings and fragments describe one visit, not a different page.
  const clean = path.split(/[?#]/)[0] ?? "";
  return clean.length > MAX_PATH ? clean.slice(0, MAX_PATH) : clean;
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
