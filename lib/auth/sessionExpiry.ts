/**
 * How long a session lasts for someone who did **not** ask to be remembered.
 *
 * The session cookie was supposed to handle this: drop its lifetime and it dies
 * with the browser. It is written correctly — the response carries no `Max-Age`
 * and no `Expires`, confirmed on the wire — but two things defeat it. Chrome
 * family browsers *restore* session cookies when "continue where you left off"
 * is on, and macOS keeps the process alive when the last window closes. The
 * browser hands the same cookie back and the server cannot tell it was ever
 * shut.
 *
 * Nothing server-side can detect the close. What it can do is refuse a session
 * that is simply too old, which produces the behaviour people are actually
 * asking for: quit, come back later, sign in again.
 *
 * Deliberately an **absolute** age rather than a sliding one. A sliding window
 * has to be refreshed into the token, and refreshing the token makes Auth.js
 * re-issue the session cookie with its configured `maxAge` — which would put
 * the seven-day expiry straight back on the cookie the rewrite just removed.
 * An absolute stamp is written once and never fights it.
 */

/** Absolute lifetime of a session the user did not ask to keep. */
export const UNREMEMBERED_MAX_SEC = 8 * 60 * 60;

export type SessionAge = {
  /** True when the "remember me" box was ticked. */
  remember?: boolean;
  /** Epoch ms the session began. Never updated after sign-in. */
  startedAt?: number;
};

/**
 * Whether this session is too old to honour.
 *
 * A remembered session never expires this way — it keeps the seven days the
 * token itself is good for.
 *
 * A token with no `startedAt` is left alone. Those were issued before this
 * check existed, and expiring them would sign out every user currently online
 * the moment it shipped, including the ones who asked to be remembered.
 */
export function sessionIsStale(token: SessionAge, now = Date.now()): boolean {
  if (token.remember) return false;
  if (typeof token.startedAt !== "number") return false;

  // A clock that has gone backwards must not expire anything.
  return (now - token.startedAt) / 1000 > UNREMEMBERED_MAX_SEC;
}
