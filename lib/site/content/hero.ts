import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { Bilingual } from "@/lib/content/types";
import type { StatFormat } from "@/lib/site/statFormat";
import { countStat, findStatSource } from "@/lib/site/statSources";

export const HERO_INTERVAL_KEY = "hero_interval_s";

const DEFAULT_INTERVAL_MS = 5000;

export type HeroStatView = {
  label: Bilingual;
  /** A counter key; when set, the drift settings are ignored. */
  source: string;
  format: StatFormat;
  /** The real count for a sourced figure; the admin's start value otherwise. */
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
  suffix: string;
};

export type HeroSlideView = {
  mediaUrl: string | null;
  mediaType: string | null;
  mock: string | null;
  badge: Bilingual | null;
  title: Bilingual;
  text: Bilingual;
  ctaLabel: Bilingual | null;
  ctaUrl: string;
  stats: HeroStatView[];
};

/** Current counts for each distinct counter key, queried once each. */
async function countSources(keys: string[]): Promise<Map<string, number>> {
  const counted = new Map<string, number>();
  await Promise.all(
    [...new Set(keys)].map(async (key) => {
      const source = findStatSource(key);
      const n = source ? await countStat(source) : null;
      if (n !== null) counted.set(key, n);
    }),
  );
  return counted;
}

/** Published slides with their figures. */
export async function getHeroSlides(): Promise<HeroSlideView[]> {
  const rows = await prisma.heroSlide.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { stats: { orderBy: { order: "asc" } } },
  });
  const counted = await countSources(rows.flatMap((s) => s.stats.map((t) => t.source)).filter(Boolean));

  return rows.map((s) => ({
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    mock: s.mock,
    badge: s.badgeKa ? bilingual(s.badgeKa, s.badgeEn) : null,
    title: bilingual(s.titleKa, s.titleEn),
    text: bilingual(s.textKa, s.textEn),
    ctaLabel: s.ctaLabelKa ? bilingual(s.ctaLabelKa, s.ctaLabelEn) : null,
    ctaUrl: s.ctaUrl,
    stats: s.stats.map((t) => {
      const live = t.source ? counted.get(t.source) : undefined;
      return {
        label: bilingual(t.labelKa, t.labelEn),
        source: live === undefined ? "" : t.source,
        format: (t.source && findStatSource(t.source)?.format) || "number",
        baseValue: live ?? t.baseValue,
        changeMin: t.changeMin,
        changeMax: t.changeMax,
        intervalMinMs: t.intervalMinMs,
        intervalMaxMs: t.intervalMaxMs,
        suffix: t.suffix,
      };
    }),
  }));
}

/** Carousel auto-advance in milliseconds. */
export async function getHeroIntervalMs(): Promise<number> {
  const row = await prisma.siteSetting.findUnique({ where: { key: HERO_INTERVAL_KEY } });
  const seconds = Number(row?.valueKa);
  return Number.isFinite(seconds) && seconds >= 1 ? seconds * 1000 : DEFAULT_INTERVAL_MS;
}
