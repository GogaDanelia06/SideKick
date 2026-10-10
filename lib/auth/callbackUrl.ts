import { DASH } from "@/lib/dashboard/routes";

export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DASH.home,
): string {
  if (!raw || raw[0] !== "/") return fallback;

  const second = raw[1];
  if (second === "/" || second === "\\") return fallback;

  return raw;
}
