import type { JsonLdData } from "@/components/seo/JsonLd";
import { SITE, absoluteUrl } from "./site";

/** The business behind the site. Emitted on every marketing page. */
export function organizationSchema(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/opengraph-image"),
    description: SITE.description,
  };
}

/** The website itself. */
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

/** FAQPage — pair with a visible FAQ list so answers can surface in search. */
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

/** BreadcrumbList — mirrors the visible breadcrumb trail on interior pages. */
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

/** The product as a SaaS app, with the price range drawn from the packages. */
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
