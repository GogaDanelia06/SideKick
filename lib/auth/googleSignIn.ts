import { cookies, headers } from "next/headers";
import { activeToken, readSession, sessionCookieName } from "./accountVault";

async function openSessionUid(): Promise<string | undefined> {
  const all = (await cookies()).getAll();
  const name = sessionCookieName(all, (await headers()).get("x-forwarded-proto") === "https");
  const token = activeToken(all, name);
  return (token ? await readSession(token, name) : null)?.uid;
}

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
