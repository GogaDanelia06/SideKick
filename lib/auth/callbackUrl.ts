import { DASH } from "@/lib/dashboard/routes";

/**
 * Restricts `?callbackUrl` to paths on this site (no open redirects). A leading
 * slash is not enough: "//host" and "/\host" both leave the site.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DASH.home,
): string {
  if (!raw || raw[0] !== "/") return fallback;

  const second = raw[1];
  if (second === "/" || second === "\\") return fallback;

  return raw;
}
