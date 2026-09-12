/**
 * Absolute session lifetime when "remember me" is off. Browsers restore session
 * cookies, so an old session is refused by age instead. Absolute rather than
 * sliding, because refreshing the token would re-issue its 7-day cookie.
 */

export const UNREMEMBERED_MAX_SEC = 8 * 60 * 60;

export type SessionAge = {
  /** True when the "remember me" box was ticked. */
  remember?: boolean;
  /** Epoch ms the session began. Never updated after sign-in. */
  startedAt?: number;
};

/** Remembered sessions, and tokens issued before `startedAt` existed, never go stale. */
export function sessionIsStale(token: SessionAge, now = Date.now()): boolean {
  if (token.remember) return false;
  if (typeof token.startedAt !== "number") return false;

  return (now - token.startedAt) / 1000 > UNREMEMBERED_MAX_SEC;
}
