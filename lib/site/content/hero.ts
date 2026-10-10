import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";
import type { StatFormat } from "@/lib/site/statFormat";
import type { Bilingual } from "@/lib/content/types";

export type HeroStatView = {
  label: Bilingual;
  source: string;
  format: StatFormat;
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

export async function getHeroSlides(): Promise<HeroSlideView[]> {
  const rows = await prisma.heroSlide.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { stats: { orderBy: { order: "asc" } } },
  });

  const keys = [...new Set(rows.flatMap((s) => s.stats.map((t) => t.source)).filter(Boolean))];
  const counted = new Map<string, number>();
  await Promise.all(
    keys.map(async (key) => {
      const source = findStatSource(key);
      if (!source) return;
      const n = await countStat(source);
      if (n !== null) counted.set(key, n);
    }),
  );

  return rows.map((s) => ({
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    mock: s.mock,
    badge: s.badgeKa ? { ka: s.badgeKa, en: s.badgeEn || s.badgeKa } : null,
    title: { ka: s.titleKa, en: s.titleEn || s.titleKa },
    text: { ka: s.textKa, en: s.textEn || s.textKa },
    ctaLabel: s.ctaLabelKa ? { ka: s.ctaLabelKa, en: s.ctaLabelEn || s.ctaLabelKa } : null,
    ctaUrl: s.ctaUrl,
    stats: s.stats.map((t) => {
      const live = t.source ? counted.get(t.source) : undefined;
      const source = t.source ? findStatSource(t.source) : undefined;
      const isLive = live !== undefined;

      return {
        label: { ka: t.labelKa, en: t.labelEn || t.labelKa },
        source: isLive ? t.source : "",
        format: source?.format ?? ("number" as StatFormat),
        baseValue: isLive ? live : t.baseValue,
        changeMin: t.changeMin,
        changeMax: t.changeMax,
        intervalMinMs: t.intervalMinMs,
        intervalMaxMs: t.intervalMaxMs,
        suffix: t.suffix,
      };
    }),
  }));
}

export async function getHeroIntervalMs(): Promise<number> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "hero_interval_s" } });
  const s = Number(row?.valueKa);
  return Number.isFinite(s) && s >= 1 ? s * 1000 : 5000;
}
