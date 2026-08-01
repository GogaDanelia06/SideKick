import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything behind a login, plus the auth screens themselves. These
      // carry noindex too; the disallow just saves crawl budget on pages that
      // would only ever redirect.
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/login",
        "/register",
        "/forgot",
        "/reset",
        // Pure redirect — nothing to index, and its answer differs per visitor.
        "/start",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
