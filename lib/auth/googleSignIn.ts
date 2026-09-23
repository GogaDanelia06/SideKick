import { cookies, headers } from "next/headers";
import { activeToken, readSession, sessionCookieName } from "./accountVault";

/** Who is signed in on this browser right now, if anyone. */
async function openSessionUid(): Promise<string | undefined> {
  const all = (await cookies()).getAll();
  const name = sessionCookieName(all, (await headers()).get("x-forwarded-proto") === "https");
  const token = activeToken(all, name);
  return (token ? await readSession(token, name) : null)?.uid;
}

/**
 * Whether a sign-in may go ahead. Runs before Auth.js decides what to do with the login.
 *
 * Google is let in only with an address Google itself has confirmed, and never while
 * someone else is signed in: Auth.js would then attach that Google login to the open
 * account, and every later Google sign-in would open that account instead. The account
 * switcher sets the open account aside first, so this refuses only stray sign-ins.
 */
export async function googleSignInAllowed({
  account,
  profile,
  user,
}: {
  account?: { provider?: string } | null;
  profile?: { email_verified?: unknown } | null;
  user?: { id?: string } | null;
}): Promise<boolean> {
  if (account?.provider !== "google") return true;
  if (profile?.email_verified !== true) return false;

  const openUid = await openSessionUid();
  return !openUid || openUid === user?.id;
}
