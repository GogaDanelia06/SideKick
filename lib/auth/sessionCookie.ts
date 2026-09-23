/** Auth.js session cookie names, including the `__Secure-` prefix and chunked `.0`, `.1` parts. */
export const SESSION_COOKIE = /authjs\.session-token(\.\d+)?$/;

/** Every chunk of the session cookie, from a full cookie list. */
export function sessionCookies<T extends { name: string }>(all: T[]): T[] {
  return all.filter((c) => SESSION_COOKIE.test(c.name));
}

/** Other accounts signed in on this browser, one parked session per cookie (lib/auth/accountVault.ts). */
export const VAULT_PREFIX = "sk.acct.";

/** Besides the open one: five accounts at once, each kept in a cookie of its own. */
export const MAX_OTHER_ACCOUNTS = 4;

/** The cookies that together keep a browser signed in: the session, in all its chunks, and the parked accounts. */
export const isSignInCookie = (name: string) => SESSION_COOKIE.test(name) || name.startsWith(VAULT_PREFIX);

/**
 * A Set-Cookie that deletes `name`. Browsers ignore one for a `__Secure-` name unless
 * it carries the Secure flag itself, which a plain `cookies.delete()` leaves out.
 */
export function expiredCookie(name: string, secure: boolean) {
  return {
    name,
    value: "",
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secure || name.startsWith("__Secure-"),
  };
}
