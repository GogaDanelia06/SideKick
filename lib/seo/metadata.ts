import type { Metadata } from "next";
import { getPageSeo } from "@/lib/site/content";
import { OG_IMAGE, SITE } from "./site";

/** Admin overrides, as returned by getPageSeo(). Empty string = not set. */
export type SeoOverrides = {
  title?: string;
  description?: string;
  canonical?: string;
  indexable?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
};

type PageMeta = {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  path: string;
  index?: boolean;
  /** What the admin set for this page in the panel. Wins over the defaults. */
  overrides?: SeoOverrides;
};

/**
 * Builds a page's metadata from three layers, in order of precedence:
 * admin override → the page's own value → the site-wide default.
 *
 * Every override is skipped when blank, which is what lets an admin clear a
 * field to fall back rather than publish an empty tag.
 */
export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  index = true,
  overrides = {},
}: PageMeta): Metadata {
  const pick = (over: string | undefined, fallback: string) => over?.trim() || fallback;

  const desc = pick(overrides.description, description ?? SITE.description);
  const defaultTitle = absoluteTitle ?? (title ? `${title} | ${SITE.name}` : SITE.title);
  const resolvedTitle = pick(overrides.title, defaultTitle);

  const ogTitle = pick(overrides.ogTitle, resolvedTitle);
  const ogDescription = pick(overrides.ogDescription, desc);
  const ogImage = overrides.ogImageUrl?.trim()
    ? { url: overrides.ogImageUrl.trim(), alt: ogTitle }
    : OG_IMAGE;

  const indexable = overrides.indexable ?? index;

  return {
    title: { absolute: resolvedTitle },
    description: desc,
    alternates: { canonical: pick(overrides.canonical, path) },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      alternateLocale: SITE.altLocale,
      url: path,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage.url],
    },
    ...(indexable ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * A page's `generateMetadata`, with the admin's overrides already applied.
 *
 * Pages call this instead of `pageMetadata` directly so that adding a new
 * public page costs one line and can never forget to read its overrides:
 *
 *   export const generateMetadata = seoFor({ title: "ფასები", path: "/pricing" });
 *
 * The page must also be dynamic — otherwise the overrides are baked in at
 * build time and editing them in the panel would change nothing.
 */
export function seoFor(base: Omit<PageMeta, "overrides">) {
  return async function generateMetadata(): Promise<Metadata> {
    return pageMetadata({ ...base, overrides: await getPageSeo(base.path) });
  };
}
