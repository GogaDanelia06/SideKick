import { DASH } from "@/lib/dashboard/routes";

/**
 * Narrows a `?callbackUrl` from the query string to somewhere on this site.
 *
 * The value arrives in a URL anyone can write, and it is handed to
 * `router.push()` — so unchecked it is an open redirect: a link to our own
 * login page that lands the customer on somebody else's, still believing they
 * are on sidekick.ge. That is the shape a credential-phishing link takes.
 *
 * `startsWith("/")` is the obvious check and it is not enough. `//evil.com` is
 * protocol-relative — the browser reads it as a host, not a path — and some
 * browsers normalise a backslash to a slash, so `/\evil.com` gets there too.
 * Both begin with a slash and both leave the site. Hence the second character
 * is checked as well.
 *
 * Kept as a pure function in its own module rather than inline in the two forms
 * that need it: one implementation is one thing to get right, and this way it
 * can be tested directly — see callbackUrl.test.ts.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DASH.home,
): string {
  if (!raw || raw[0] !== "/") return fallback;

  // "//host" and "/\host" both point off-site despite the leading slash.
  const second = raw[1];
  if (second === "/" || second === "\\") return fallback;

  return raw;
}
