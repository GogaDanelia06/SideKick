export const UNREMEMBERED_MAX_SEC = 8 * 60 * 60;

export type SessionAge = {
  remember?: boolean;
  startedAt?: number;
};

export function sessionIsStale(token: SessionAge, now = Date.now()): boolean {
  if (token.remember) return false;
  if (typeof token.startedAt !== "number") return false;

  return (now - token.startedAt) / 1000 > UNREMEMBERED_MAX_SEC;
}
