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
  overrides?: SeoOverrides;
};

/** Page metadata: admin override → page value → site default. Blank overrides are ignored. */
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

/** A page's `generateMetadata` with the admin's SEO overrides applied. */
export function seoFor(base: Omit<PageMeta, "overrides">) {
  return async function generateMetadata(): Promise<Metadata> {
    return pageMetadata({ ...base, overrides: await getPageSeo(base.path) });
  };
}
