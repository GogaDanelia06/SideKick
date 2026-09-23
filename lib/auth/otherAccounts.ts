import { cookies, headers } from "next/headers";
import { otherAccounts, readVault, sessionCookieName, type OtherAccount } from "./accountVault";

/** The other accounts signed in on this browser, for a server-rendered account menu. */
export async function listOtherAccounts(activeUid?: string): Promise<OtherAccount[]> {
  const all = (await cookies()).getAll();
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  return otherAccounts(await readVault(all, sessionCookieName(all, secure)), activeUid);
}
