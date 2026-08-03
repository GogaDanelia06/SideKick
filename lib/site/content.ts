import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";
import { formatStat, type StatFormat } from "@/lib/site/statFormat";
import type { Bilingual } from "@/lib/content/types";
import { PLAN_SUPPORT, type Package } from "@/lib/content/packages";
import type { FaqItem } from "@/lib/content/faq";

export type SiteStatView = {
  value: string;
  label: Bilingual;
  /** Set when the figure is counted; the browser keeps it up to date. */
  source: string;
  /** The raw count behind `value`, so the browser can animate to the next one. */
  n: number | null;
  format: StatFormat;
};

/**
 * The figures in the landing strip.
 *
 * A row with a `source` is counted live; one without shows what an admin typed.
 * A source that no longer exists in the registry falls back to the stored value
 * rather than disappearing, so removing a counter from the code never blanks a
 * figure on the public page.
 *
 * The raw number travels alongside the formatted one. Rendering the real figure
 * server-side is what makes the first paint correct; the raw number is what the
 * browser needs to count up from when the next visitor signs up.
 */
export async function getSiteStats(): Promise<SiteStatView[]> {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });

  return Promise.all(
    rows.map(async (r) => {
      const source = r.source ? findStatSource(r.source) : undefined;
      if (!source) {
        return {
          value: r.value,
          label: { ka: r.labelKa, en: r.labelEn },
          source: "",
          n: null,
          format: "number" as StatFormat,
        };
      }

      const n = await countStat(source);
      return {
        // A failed count keeps the stored figure — stale, but not a blank slot.
        value: n === null ? r.value : formatStat(n, source.format),
        label: { ka: r.labelKa, en: r.labelEn },
        source: r.source,
        n,
        format: source.format,
      };
    }),
  );
}

function cap(n: number, unlimited: Bilingual, ka: (v: string) => string, en: (v: string) => string): Bilingual {
  if (n < 0) return unlimited;
  const v = n.toLocaleString("en-US");
  return { ka: ka(v), en: en(v) };
}

function planFeatures(p: {
  key: string;
  msgLimit: number;
  channelCap: number;
  userCap: number;
  productCap: number;
}): Bilingual[] {
  return [
    cap(
      p.msgLimit,
      { ka: "შეუზღუდავი შეტყობინება", en: "Unlimited messages" },
      (v) => `${v} შეტყობინება / თვე`,
      (v) => `${v} messages / month`,
    ),
    cap(
      p.channelCap,
      { ka: "ყველა არხი", en: "All channels" },
      (v) => `${v} არხი`,
      (v) => `${v} channel${p.channelCap === 1 ? "" : "s"}`,
    ),
    cap(
      p.userCap,
      { ka: "შეუზღუდავი მომხმარებელი", en: "Unlimited users" },
      (v) => `${v} მომხმარებელი`,
      (v) => `${v} user${p.userCap === 1 ? "" : "s"}`,
    ),
    cap(
      p.productCap,
      { ka: "შეუზღუდავი პროდუქტი", en: "Unlimited products" },
      (v) => `${v} პროდუქტი`,
      (v) => `${v} products`,
    ),
    PLAN_SUPPORT[p.key] ?? { ka: "მხარდაჭერა", en: "Support" },
  ];
}

export async function getPlans(): Promise<Package[]> {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  return plans.map((p) => {
    // Admin-written bullets come after the ones derived from the caps, pairing
    // each Georgian line with the English one at the same index.
    const extras: Bilingual[] = p.extrasKa
      .map((ka, i) => ({ ka: ka.trim(), en: (p.extrasEn[i] ?? ka).trim() }))
      .filter((b) => b.ka);

    return {
      name: { ka: p.name, en: p.nameEn || p.name },
      price: p.price,
      price3m: p.price3m,
      price12m: p.price12m,
      featured: p.featured,
      features: [...planFeatures(p), ...extras],
    };
  });
}

export async function getSiteFaq(): Promise<FaqItem[]> {
  const rows = await prisma.siteFaq.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    question: { ka: r.questionKa, en: r.questionEn },
    answer: { ka: r.answerKa, en: r.answerEn },
  }));
}

/**
 * Read editable texts by key.
 *
 * Returns only the keys an admin has actually saved (and left non-empty), so
 * call sites can fall back to the hardcoded copy with `??`. That keeps every
 * default next to the component that uses it rather than in one giant map.
 */
export async function getSiteTexts(keys: string[]): Promise<Record<string, Bilingual>> {
  if (keys.length === 0) return {};
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const out: Record<string, Bilingual> = {};
  for (const r of rows) {
    const ka = r.valueKa.trim();
    if (!ka) continue;
    out[r.key] = { ka, en: r.valueEn.trim() || ka };
  }
  return out;
}

/** Single-language value (URLs, phone numbers, emails). */
export async function getSiteValue(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.valueKa.trim() || null;
}

/* ── Hero carousel ──────────────────────────────────────────────────────── */

export type HeroStatView = {
  label: Bilingual;
  /** A counter key — when set, the drift settings below are ignored. */
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

/**
 * Published slides with their figures, in order.
 *
 * Every distinct counter used across the carousel is read once, not once per
 * figure — two slides showing "users registered" cost one query between them.
 */
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
      // An unknown or uncountable source degrades to a plain figure rather than
      // to an empty box: the label still makes sense next to the stored number.
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

/** Carousel auto-advance in milliseconds. Defaults to 5 seconds. */
export async function getHeroIntervalMs(): Promise<number> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "hero_interval_s" } });
  const s = Number(row?.valueKa);
  return Number.isFinite(s) && s >= 1 ? s * 1000 : 5000;
}

/* ── Content boxes ──────────────────────────────────────────────────────── */

export type BoxView = { icon: string; title: Bilingual; body: Bilingual };

/** Published landing-page benefit boxes, in order. */
export async function getBenefits(): Promise<BoxView[]> {
  const rows = await prisma.benefit.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((b) => ({
    icon: b.icon,
    title: { ka: b.titleKa, en: b.titleEn || b.titleKa },
    body: { ka: b.descKa, en: b.descEn || b.descKa },
  }));
}

/** Published pricing-page service boxes, in order. */
export async function getServiceBoxes(): Promise<BoxView[]> {
  const rows = await prisma.serviceBox.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((s) => ({
    icon: s.icon,
    title: { ka: s.titleKa, en: s.titleEn || s.titleKa },
    body: { ka: s.bodyKa, en: s.bodyEn || s.bodyKa },
  }));
}

/* ── Legal documents ────────────────────────────────────────────────────── */

export type LegalSectionView = {
  heading: Bilingual;
  paragraphs: Bilingual[];
  bullets: Bilingual[];
};

/** Published sections of a legal document, in order. Empty means the caller
 *  should fall back to the drafted copy in lib/content/legal.ts. */
export async function getLegalSections(doc: string): Promise<LegalSectionView[]> {
  const rows = await prisma.legalSection.findMany({
    where: { doc, published: true },
    orderBy: { order: "asc" },
  });

  const split = (ka: string, en: string, sep: RegExp): Bilingual[] => {
    const a = ka.split(sep).map((s) => s.trim()).filter(Boolean);
    const b = en.split(sep).map((s) => s.trim()).filter(Boolean);
    return a.map((text, i) => ({ ka: text, en: b[i] ?? text }));
  };

  return rows.map((r) => ({
    heading: { ka: r.headingKa, en: r.headingEn || r.headingKa },
    paragraphs: split(r.bodyKa, r.bodyEn, /\n\s*\n/),
    bullets: split(r.bulletsKa, r.bulletsEn, /\n/),
  }));
}

/** A legal document's admin-set heading, or null to use the drafted title. */
export async function getLegalTitle(doc: string): Promise<Bilingual | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: `legal_${doc}_title` } });
  const ka = row?.valueKa.trim();
  if (!ka) return null;
  return { ka, en: row?.valueEn.trim() || ka };
}

/* ── Per-page SEO ───────────────────────────────────────────────────────── */

/** What an admin has overridden for one page. Empty strings mean "not set",
 *  which the metadata builder reads as "use the built-in default". */
export type PageSeoOverrides = {
  title: string;
  description: string;
  canonical: string;
  indexable: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

const NO_OVERRIDES: PageSeoOverrides = {
  title: "",
  description: "",
  canonical: "",
  indexable: true,
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
};

/**
 * SEO overrides for one path.
 *
 * Returns a fully-populated object even when no row exists, so callers never
 * branch on null — an untouched page simply gets empty overrides and keeps the
 * defaults it always had.
 */
export async function getPageSeo(path: string): Promise<PageSeoOverrides> {
  const row = await prisma.pageSeo.findUnique({ where: { path } });
  if (!row) return NO_OVERRIDES;
  return {
    title: row.title.trim(),
    description: row.description.trim(),
    canonical: row.canonical.trim(),
    indexable: row.indexable,
    ogTitle: row.ogTitle.trim(),
    ogDescription: row.ogDescription.trim(),
    ogImageUrl: row.ogImageUrl.trim(),
  };
}
