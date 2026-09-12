import config from "@/seo.config.json";

/** Site-wide SEO settings from seo.config.json; NEXT_PUBLIC_SITE_URL overrides the URL on previews. */

const configuredUrl = config.website.url || config.defaults.canonicalDomain;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? configuredUrl).replace(/\/+$/, "");

export const SITE = {
  name: config.website.name,
  url: SITE_URL,
  title: config.website.title,
  description: config.website.description,
  locale: config.defaults.locale,
  altLocale: config.defaults.altLocale,
  /** The `lang` attribute on <html>. */
  language: config.defaults.language,
} as const;

export const OG_IMAGE = {
  url: config.defaults.ogImage,
  width: config.defaults.ogImageWidth,
  height: config.defaults.ogImageHeight,
  alt: config.website.title,
} as const;

export const ORGANIZATION = {
  name: config.organization.name || config.website.name,
  legalName: config.organization.legalName,
  logo: config.organization.logo,
  email: config.organization.email,
  phone: config.organization.phone,
  address: config.organization.address,
  /** Profile URLs — these become `sameAs` in the Organization schema. */
  socialLinks: config.organization.socialLinks as string[],
} as const;

export const ANALYTICS = config.analytics;

/** Search-engine ownership tags. Blank entries are never rendered. */
export const VERIFICATION = config.verification;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
