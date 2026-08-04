import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";
import { autoKey, readAutoStat } from "@/lib/site/autoStat";

export const dynamic = "force-dynamic";

/** How long one round of reading is reused for. */
const CACHE_MS = 10_000;

let cache: { at: number; body: Record<string, number> } | null = null;

/**
 * Only the counters an admin actually put on the site.
 *
 * The registry knows how to count a dozen things; publishing all of them here
 * would hand a visitor figures the owner never chose to show — "3 businesses
 * registered" is nobody else's business until it is put on the page.
 */
async function countedKeys(): Promise<string[]> {
  const [strip, hero] = await Promise.all([
    prisma.siteStat.findMany({
      where: { mode: "LIVE", source: { not: "" } },
      select: { source: true },
    }),
    prisma.heroSlideStat.findMany({
      where: { source: { not: "" }, slide: { published: true } },
      select: { source: true },
    }),
  ]);
  return [...new Set([...strip, ...hero].map((r) => r.source))];
}

/**
 * Every figure on the landing page that does not stay still.
 *
 * Two kinds share one payload: counters read from the database, and the
 * drifting figures whose next step is drawn here rather than in the visitor's
 * browser. The client does not care which is which — it polls once for both.
 *
 * One round of work is shared for ten seconds, so a busy day costs the database
 * a handful of queries a minute rather than a handful per visitor.
 */
export async function GET() {
  if (!cache || Date.now() - cache.at >= CACHE_MS) {
    const body: Record<string, number> = {};

    const [keys, autos] = await Promise.all([
      countedKeys(),
      prisma.siteStat.findMany({
        where: { mode: "AUTO" },
        select: {
          id: true,
          key: true,
          baseValue: true,
          changeMin: true,
          changeMax: true,
          intervalMinMs: true,
          intervalMaxMs: true,
          autoValue: true,
          autoNextAt: true,
        },
      }),
    ]);

    await Promise.all([
      ...keys.map(async (key) => {
        const source = findStatSource(key);
        if (!source) return;
        const n = await countStat(source);
        if (n !== null) body[key] = n;
      }),
      ...autos.map(async (row) => {
        body[autoKey(row.key)] = await readAutoStat(row);
      }),
    ]);

    cache = { at: Date.now(), body };
  }

  return NextResponse.json(cache.body, { headers: { "Cache-Control": "no-store" } });
}
