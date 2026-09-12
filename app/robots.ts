import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and auth screens (all noindex too); disallowing saves crawl budget.
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/login",
        "/register",
        "/forgot",
        "/reset",
        "/start",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
