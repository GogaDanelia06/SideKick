 import type { JsonLdData } from "@/components/seo/JsonLd";
import { ORGANIZATION, SITE, absoluteUrl } from "./site";

/**
 * The organisation behind the site.
 *
 * Every optional field is dropped when blank rather than emitted empty —
 * schema.org treats an empty string as a claim, and a wrong claim is worse for
 * a rich result than a missing one.
 */
export function organizationSchema(): JsonLdData {
  const { name, legalName, logo, email, phone, address, socialLinks } = ORGANIZATION;

  const postalAddress =
    address.street || address.city
      ? {
          "@type": "PostalAddress",
          ...(address.street ? { streetAddress: address.street } : {}),
          ...(address.city ? { addressLocality: address.city } : {}),
          ...(address.region ? { addressRegion: address.region } : {}),
          ...(address.postalCode ? { postalCode: address.postalCode } : {}),
          ...(address.country ? { addressCountry: address.country } : {}),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: SITE.url,
    logo: absoluteUrl(logo),
    description: SITE.description,
    ...(legalName ? { legalName } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(postalAddress ? { address: postalAddress } : {}),
    ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
  };
}

export function websiteSchema(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ka-GE",
    description: SITE.description,
  };
}

export function webPageSchema(page: {
  type?: "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  path: string;
}): JsonLdData {
  const url = absoluteUrl(page.path);
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    name: page.name,
    description: page.description,
    url,
    inLanguage: "ka-GE",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    primaryImageOfPage: absoluteUrl("/opengraph-image"),
  };
}

export function faqSchema(items: { question: string; answer: string }[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function softwareAppSchema(offer: {
  lowPrice: string;
  highPrice: string;
  priceCurrency: string;
}): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/pricing"),
    description: SITE.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: offer.priceCurrency,
      lowPrice: offer.lowPrice,
      highPrice: offer.highPrice,
      offerCount: 3,
    },
  };
}
