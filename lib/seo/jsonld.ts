 import type { JsonLdData } from "@/components/seo/JsonLd";
import type { ContactDetails } from "@/lib/content/contactDetails";
import { ORGANIZATION, SITE, absoluteUrl } from "./site";

/**
 * Organization schema; blank optional fields are omitted rather than emitted empty. The
 * contact details from the admin panel fill whatever seo.config.json leaves blank.
 */
export function organizationSchema(contact?: ContactDetails): JsonLdData {
  const { name, legalName, logo, address } = ORGANIZATION;
  const email = ORGANIZATION.email || contact?.email?.value;
  const phone = ORGANIZATION.phone || contact?.phone?.href.replace(/^tel:/, "");
  const socialLinks = ORGANIZATION.socialLinks.length > 0 ? ORGANIZATION.socialLinks : (contact?.socials ?? []).map((s) => s.href);

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
