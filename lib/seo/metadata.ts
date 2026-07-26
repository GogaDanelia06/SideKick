import type { Metadata } from "next";
import { OG_IMAGE, SITE } from "./site";

type PageMeta = {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  path: string;
  index?: boolean;
};

export function pageMetadata({ title, absoluteTitle, description, path, index = true }: PageMeta): Metadata {
  const desc = description ?? SITE.description;
  const ogTitle = absoluteTitle ?? (title ? `${title} | ${SITE.name}` : SITE.title);

  return {
    ...(absoluteTitle ? { title: { absolute: absoluteTitle } } : title ? { title } : {}),
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
