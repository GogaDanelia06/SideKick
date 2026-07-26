export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sidekick.ge").replace(
  /\/+$/,
  "",
);

export const SITE = {
  name: "Sidekick",
  url: SITE_URL,
  title: "Sidekick — AI ასისტენტი ბიზნესისთვის",
  description:
    "Sidekick პასუხობს კლიენტებს 24/7 Facebook-ზე, Instagram-ზე და WhatsApp-ზე, აგროვებს ლიდებს და ზრდის გაყიდვებს — ყოველგვარი კოდის გარეშე.",
  locale: "ka_GE",
  altLocale: "en_US",
} as const;

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE.title,
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
