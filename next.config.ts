import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Analytics is off by default (see seo.config.json), so its domains are not
 * allowed here. Turning a tag on means adding the matching entries below,
 * otherwise the browser silently blocks the script and the tag never reports:
 *
 *   Google Analytics / Tag Manager
 *     script-src  + https://www.googletagmanager.com
 *     connect-src + https://www.google-analytics.com https://*.analytics.google.com
 *     img-src     + https://www.google-analytics.com
 *
 *   Facebook Pixel
 *     script-src  + https://connect.facebook.net
 *     img-src     + https://www.facebook.com
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.youtube.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
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
