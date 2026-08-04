/**
 * Whether Google sign-in is actually available.
 *
 * `auth.ts` only registers the Google provider when a client id is present, so
 * without one the button rendered but did nothing — a visitor clicking it got a
 * dead end with no explanation. The forms ask here instead of assuming.
 *
 * Read on the server and passed down as a prop: the client bundle has no
 * business knowing the shape of our environment.
 */
export function googleSignInEnabled(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}
