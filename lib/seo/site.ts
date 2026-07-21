/** Canonical production origin. Override per-environment with NEXT_PUBLIC_SITE_URL
 *  (e.g. a preview URL); defaults to the live domain. No trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sidekick.ge").replace(
  /\/+$/,
  "",
);

/** Site-wide SEO constants. Copy is Georgian to match `<html lang="ka">`. */
export const SITE = {
  name: "Sidekick",
  url: SITE_URL,
  title: "Sidekick — AI ასისტენტი ბიზნესისთვის",
  description:
    "Sidekick პასუხობს კლიენტებს 24/7 Facebook-ზე, Instagram-ზე და WhatsApp-ზე, აგროვებს ლიდებს და ზრდის გაყიდვებს — ყოველგვარი კოდის გარეშე.",
  locale: "ka_GE",
  altLocale: "en_US",
} as const;

/** The generated share card (see app/opengraph-image.tsx). Served at this path;
 *  resolved to an absolute URL by metadataBase. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE.title,
} as const;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
