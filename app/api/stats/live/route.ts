import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";
import { autoKey, readAutoStat } from "@/lib/site/autoStat";

export const dynamic = "force-dynamic";

const CACHE_MS = 10_000;

let cache: { at: number; body: Record<string, number> } | null = null;

/** Only counters that are actually shown on the site are published. */
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

/** Live and drifting landing-page figures, recomputed at most every CACHE_MS per instance. */
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
