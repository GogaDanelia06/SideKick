import { vi } from "vitest";
import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";

/** The cookie jar and helpers shared by the account switcher's tests. */
export type Stored = { name: string; value: string; expires?: Date };
export const SECRET = "test-secret-for-the-account-switcher-0123456789";
export const SESSION = "authjs.session-token";
export const jar = new Map<string, Stored>();

export const cookieJar = () => ({
  getAll: () => [...jar.values()],
  set: (a: Stored | string, value?: string, options?: { expires?: Date }) => {
    const cookie = typeof a === "string" ? { name: a, value: value ?? "", ...options } : a;
    // An expiry in the past is how a cookie is deleted.
    if (cookie.expires && cookie.expires.getTime() < Date.now()) jar.delete(cookie.name);
    else jar.set(cookie.name, cookie);
  },
});

export const session = (uid: string, extra: Record<string, unknown> = {}) =>
  encode({ token: { uid, email: `${uid}@x.ge`, remember: true, startedAt: Date.now(), ...extra }, secret: SECRET, salt: SESSION, maxAge: 3600 });

export const put = (name: string, value: string) => jar.set(name, { name, value });
export const value = (name: string) => jar.get(name)?.value;

export function reset() {
  jar.clear();
  vi.stubEnv("AUTH_SECRET", SECRET);
}

export const request = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/accounts", {
    method: "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", ...headers },
    body: JSON.stringify(body),
  });
