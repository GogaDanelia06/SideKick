import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";

export const dynamic = "force-dynamic";

/** How long one round of counting is reused for. */
const CACHE_MS = 10_000;

let cache: { at: number; body: Record<string, number> } | null = null;

/**
 * Only the counters an admin actually put on the site.
 *
 * The registry knows how to count ten things; publishing all ten here would
 * hand a visitor figures the owner never chose to show — "3 businesses
 * registered" is nobody else's business until it is put on the page.
 */
async function publishedKeys(): Promise<string[]> {
  const [strip, hero] = await Promise.all([
    prisma.siteStat.findMany({ where: { source: { not: "" } }, select: { source: true } }),
    prisma.heroSlideStat.findMany({
      where: { source: { not: "" }, slide: { published: true } },
      select: { source: true },
    }),
  ]);
  return [...new Set([...strip, ...hero].map((r) => r.source))];
}

/**
 * The figures behind the live numbers on the landing page.
 *
 * Every open tab polls this, so one round of counting is shared for ten seconds
 * — a busy day costs the database six queries a minute, not six per visitor.
 * Aggregate counts only, and only the published ones.
 */
export async function GET() {
  if (!cache || Date.now() - cache.at >= CACHE_MS) {
    const body: Record<string, number> = {};
    const keys = await publishedKeys();

    await Promise.all(
      keys.map(async (key) => {
        const source = findStatSource(key);
        if (!source) return;
        const n = await countStat(source);
        if (n !== null) body[key] = n;
      }),
    );

    cache = { at: Date.now(), body };
  }

  return NextResponse.json(cache.body, { headers: { "Cache-Control": "no-store" } });
}
