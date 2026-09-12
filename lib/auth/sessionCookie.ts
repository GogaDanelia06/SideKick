/** Auth.js session cookie names, including the `__Secure-` prefix and chunked `.0`, `.1` parts. */
export const SESSION_COOKIE = /authjs\.session-token(\.\d+)?$/;

/** Every chunk of the session cookie, from a full cookie list. */
export function sessionCookies<T extends { name: string }>(all: T[]): T[] {
  return all.filter((c) => SESSION_COOKIE.test(c.name));
}
