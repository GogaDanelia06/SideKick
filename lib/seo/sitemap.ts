import { prisma } from "@/lib/db";
import { legalTitleKey } from "@/lib/site/textKeys";

export type SitemapEntry = {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  /** Setting keys whose edits change this page. */
  settingKeys: string[];
  /** The last time any table behind this page changed. */
  contentUpdatedAt: () => Promise<Date | null>;
};

const maxDate = (...dates: (Date | null | undefined)[]): Date | null => {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : null;
};

async function latest<T extends { updatedAt: Date }>(rows: Promise<T[]>): Promise<Date | null> {
  return maxDate(...(await rows).map((r) => r.updatedAt));
}

function legalPage(doc: string, path: string): SitemapEntry {
  return {
    path,
    changeFrequency: "yearly",
    priority: 0.3,
    settingKeys: [legalTitleKey(doc)],
    contentUpdatedAt: () =>
      latest(prisma.legalSection.findMany({ where: { doc }, select: { updatedAt: true } })),
  };
}

/** Public pages with the sources behind them, so `lastmod` reflects real content edits. */
export const SITEMAP_PAGES: SitemapEntry[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    settingKeys: [
      "story_title",
      "story_body",
      "cta_badge",
      "cta_title",
      "cta_text",
      "cta_button",
      "cta_url",
      "hero_interval_s",
    ],
    contentUpdatedAt: async () =>
      maxDate(
        await latest(prisma.heroSlide.findMany({ select: { updatedAt: true } })),
        await latest(prisma.siteStat.findMany({ select: { updatedAt: true } })),
        await latest(prisma.benefit.findMany({ select: { updatedAt: true } })),
      ),
  },
  {
    path: "/pricing",
    changeFrequency: "monthly",
    priority: 0.8,
    settingKeys: ["free_badge", "free_title", "free_text", "pricing_badge", "pricing_h1", "pricing_sub"],
    contentUpdatedAt: async () =>
      maxDate(
        await latest(prisma.serviceBox.findMany({ select: { updatedAt: true } })),
        await latest(prisma.plan.findMany({ select: { updatedAt: true } })),
      ),
  },
  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.6,
    settingKeys: ["about_title", "about_body", "about_image"],
    contentUpdatedAt: async () => null,
  },
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.6,
    settingKeys: ["contact_badge", "contact_h1", "contact_sub", "contact_email", "contact_phone"],
    contentUpdatedAt: () => latest(prisma.siteFaq.findMany({ select: { updatedAt: true } })),
  },
  legalPage("terms", "/terms"),
  legalPage("privacy", "/privacy"),
  legalPage("data-protection", "/data-protection"),
];

export type ResolvedPage = { path: string; lastModified: Date; changeFrequency: SitemapEntry["changeFrequency"]; priority: number };

/** Sitemap entries with a truthful `lastmod`; pages set to noindex are left out. */
export async function resolveSitemap(fallback: Date): Promise<ResolvedPage[]> {
  const [seoRows, settingRows] = await Promise.all([
    prisma.pageSeo.findMany(),
    prisma.siteSetting.findMany({ select: { key: true, updatedAt: true } }),
  ]);

  const seoByPath = new Map(seoRows.map((r) => [r.path, r]));
  const settingByKey = new Map(settingRows.map((r) => [r.key, r.updatedAt]));

  const out: ResolvedPage[] = [];

  for (const page of SITEMAP_PAGES) {
    const seo = seoByPath.get(page.path);
    if (seo && !seo.indexable) continue;

    const newest =
      maxDate(
        seo?.updatedAt,
        ...page.settingKeys.map((k) => settingByKey.get(k)),
        await page.contentUpdatedAt(),
      ) ?? fallback;

    // Never report a lastmod in the future.
    const lastModified = newest > fallback ? fallback : newest;

    out.push({
      path: page.path,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  return out;
}
