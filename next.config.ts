import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // Canonical host: www.sidekick.ge -> sidekick.ge (301), so Google never
      // sees the same page under two hostnames. Add legacy path -> new path
      // entries here as the site evolves.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sidekick.ge" }],
        destination: "https://sidekick.ge/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
