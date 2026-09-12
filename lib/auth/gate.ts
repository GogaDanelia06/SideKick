import { sessionIsStale, type SessionAge } from "./sessionExpiry";

/** The areas that require a signed-in user. Everything else is public. */
const GUARDED = ["/admin", "/dashboard"];

/**
 * Whether a visitor may open a path: guarded areas need a fresh session. Shared by
 * the `authorized` callback and proxy.ts so the two cannot disagree. Admin access
 * is checked against the database by `requireAdmin()`.
 */
export function gateAllows(pathname: string, user: SessionAge | undefined | null): boolean {
  if (!GUARDED.some((prefix) => pathname.startsWith(prefix))) return true;
  if (!user) return false;

  return !sessionIsStale(user);
}
