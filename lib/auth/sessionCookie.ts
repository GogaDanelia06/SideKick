/**
 * Recognises Auth.js's session cookie by name.
 *
 * There are three shapes to catch. Over https the browser is asked to enforce
 * the cookie's own rules with a `__Secure-` prefix, and a session too large for
 * one cookie is split into `…session-token.0`, `.1` and so on. Matching the
 * suffix covers all of them without hard-coding which environment this is.
 *
 * Pinned by a test because the name comes from a dependency: an upgrade that
 * renamed it would otherwise leave the code quietly matching nothing, and a
 * "remember me" box that silently stopped working is worse than one that never
 * did.
 */
export const SESSION_COOKIE = /authjs\.session-token(\.\d+)?$/;

/** Every chunk of the session cookie, from a full cookie list. */
export function sessionCookies<T extends { name: string }>(all: T[]): T[] {
  return all.filter((c) => SESSION_COOKIE.test(c.name));
}
