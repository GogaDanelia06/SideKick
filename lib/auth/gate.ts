import { sessionIsStale, type SessionAge } from "./sessionExpiry";

/** The areas that require a signed-in user. Everything else is public. */
const GUARDED = ["/admin", "/dashboard"];

/**
 * Whether this visitor may see this path.
 *
 * Signed in or not is the only question this layer can answer honestly, so it
 * is the only one asked. It used to decide admin access here too, from an
 * `isAdmin` flag copied into the token at sign-in and then believed for a week
 * — wrong in both directions. `requireAdmin()` in the admin layout asks the
 * database instead, and every page under /admin goes through it.
 *
 * Lives on its own because two callers need the same answer: the `authorized`
 * callback, and the middleware. Passing a handler to `auth()` disables
 * next-auth's built-in redirect, so if these two ever disagreed the dashboard
 * would quietly open to people who should be at the login screen.
 */
export function gateAllows(pathname: string, user: SessionAge | undefined | null): boolean {
  if (!GUARDED.some((prefix) => pathname.startsWith(prefix))) return true;
  if (!user) return false;

  // A session cookie the browser restored after being closed still looks valid,
  // so age is the only thing that gives it away.
  return !sessionIsStale(user);
}
