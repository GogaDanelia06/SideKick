/** Google sign-in is offered only when its credentials are configured. */
export function googleSignInEnabled(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}
