import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Inter, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { themeScript } from "@/lib/theme/theme-script";
import { themeCss } from "@/lib/site/theme/css";
import { cachedTheme } from "@/lib/site/theme/cached";
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
  // Only the verification tags filled in seo.config.json are emitted.
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
  // The admin theme applies to every route; cached, since this runs on every uncached request.
  const palette = themeCss(await cachedTheme());

  return (
    <html
      lang={SITE.language}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${georgian.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: palette }} />
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
