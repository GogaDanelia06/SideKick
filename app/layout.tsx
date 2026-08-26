import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Inter, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { themeScript } from "@/lib/theme/theme-script";
import { BG_KEY, backgroundCss } from "@/lib/site/backgrounds";
import { getSiteValue } from "@/lib/site/content";
import { OG_IMAGE, SITE, VERIFICATION } from "@/lib/seo/site";
import { Analytics } from "@/components/seo/Analytics";
import { PageViews } from "@/components/seo/PageViews";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
  display: "swap",
});
const georgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-geo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | Sidekick",
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    alternateLocale: SITE.altLocale,
    title: SITE.title,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Search-engine ownership tags. Only the ones filled in seo.config.json are
  // emitted — an empty verification meta tag is worse than none.
  ...(VERIFICATION.google || VERIFICATION.bing || VERIFICATION.yandex
    ? {
        verification: {
          ...(VERIFICATION.google ? { google: VERIFICATION.google } : {}),
          ...(VERIFICATION.yandex ? { yandex: VERIFICATION.yandex } : {}),
          ...(VERIFICATION.bing ? { other: { "msvalidate.01": VERIFICATION.bing } } : {}),
        },
      }
    : {}),
  ...(VERIFICATION.facebookDomain
    ? { other: { "facebook-domain-verification": VERIFICATION.facebookDomain } }
    : {}),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The admin's background choice. Read here rather than per page because it
  // applies to the marketing site and the dashboard alike, and both live under
  // this layout. Returns "" for the default, so the shipped palette costs no
  // extra bytes.
  const background = backgroundCss(await getSiteValue(BG_KEY));

  return (
    <html
      lang={SITE.language}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${georgian.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {background ? <style dangerouslySetInnerHTML={{ __html: background }} /> : null}
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <Suspense>
          <PageViews />
        </Suspense>
      </body>
    </html>
  );
}
