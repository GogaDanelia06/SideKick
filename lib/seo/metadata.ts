import type { Metadata } from "next";
import { OG_IMAGE, SITE } from "./site";

type PageMeta = {
  /** Page title without the "| Sidekick" suffix. Omit on the home page. */
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/pricing". Resolved against metadataBase. */
  path: string;
  /** Set false for private pages that must not be indexed. */
  index?: boolean;
};

/** Builds a complete Metadata object (canonical + Open Graph + Twitter) for a
 *  page. Next only shallow-merges these objects across segments, so each page
 *  needs the full set — this keeps them consistent. The og:image is supplied
 *  automatically by app/opengraph-image.tsx. */
export function pageMetadata({ title, description, path, index = true }: PageMeta): Metadata {
  const desc = description ?? SITE.description;
  const ogTitle = title ? `${title} | ${SITE.name}` : SITE.title;

  return {
    // Omit when absent so the root title.default/template still applies.
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      alternateLocale: SITE.altLocale,
      url: path,
      title: ogTitle,
      description: desc,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: [OG_IMAGE.url],
    },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}
