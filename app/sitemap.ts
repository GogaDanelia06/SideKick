import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";
import { resolveSitemap } from "@/lib/seo/sitemap";
import { log } from "@/lib/logger";

// Rebuilt hourly, never frozen at deploy time: the pages are admin-editable and
// their dates come from the content tables. An hour late is nothing to a crawler
// that reads this once a day.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallback = new Date();

  try {
    const pages = await resolveSitemap(fallback);
    return pages.map((p) => ({
      url: p.path === "/" ? SITE_URL : absoluteUrl(p.path),
      lastModified: p.lastModified,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }));
  } catch (err) {
    // A database hiccup must not serve an empty sitemap — an empty one tells
    // search engines the site has no pages. Fall back to the plain list.
    log.error("sitemap could not read content dates", err);
    return [
      { url: SITE_URL, lastModified: fallback, changeFrequency: "weekly", priority: 1 },
      { url: absoluteUrl("/pricing"), lastModified: fallback, changeFrequency: "monthly", priority: 0.8 },
      { url: absoluteUrl("/about"), lastModified: fallback, changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/contact"), lastModified: fallback, changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/terms"), lastModified: fallback, changeFrequency: "yearly", priority: 0.3 },
      { url: absoluteUrl("/privacy"), lastModified: fallback, changeFrequency: "yearly", priority: 0.3 },
      { url: absoluteUrl("/data-protection"), lastModified: fallback, changeFrequency: "yearly", priority: 0.3 },
    ];
  }
}
