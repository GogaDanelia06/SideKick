export const SESSION_COOKIE = /authjs\.session-token(\.\d+)?$/;

export function sessionCookies<T extends { name: string }>(all: T[]): T[] {
  return all.filter((c) => SESSION_COOKIE.test(c.name));
}

export const VAULT_PREFIX = "sk.acct.";

export const MAX_OTHER_ACCOUNTS = 4;

export const isSignInCookie = (name: string) => SESSION_COOKIE.test(name) || name.startsWith(VAULT_PREFIX);

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
