import { cookies, headers } from "next/headers";
import { otherAccounts, readVault, sessionCookieName, type OtherAccount } from "./accountVault";

export async function listOtherAccounts(activeUid?: string): Promise<OtherAccount[]> {
  const all = (await cookies()).getAll();
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  return otherAccounts(await readVault(all, sessionCookieName(all, secure)), activeUid);
}
