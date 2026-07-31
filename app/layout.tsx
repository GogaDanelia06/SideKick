import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { themeScript } from "@/lib/theme/theme-script";
import { OG_IMAGE, SITE, VERIFICATION } from "@/lib/seo/site";
import { Analytics } from "@/components/seo/Analytics";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE.language}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${georgian.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
