import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://yourdomain.com",
      priority: 1,
    },
    {
      url: "https://yourdomain.com/pricing",
      priority: 0.8,
    },
    {
      url: "https://yourdomain.com/about",
      priority: 0.8,
    },
    {
      url: "https://yourdomain.com/contact",
      priority: 0.8,
    },
  ];
}