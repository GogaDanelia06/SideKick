import { signOut } from "next-auth/react";
import { accountsRequest } from "@/lib/auth/accountsClient";
import { clearAiDrafts } from "@/lib/dashboard/sectionSave/drafts";
import { clearTesterChat } from "@/lib/dashboard/testerChat";

/** Ends every session on this browser and forgets what was kept aside here. */
export async function logOut() {
  clearAiDrafts();
  clearTesterChat();
  // The other signed-in accounts go too: logging out on a shared computer should leave no one behind.
  await accountsRequest("clear");
  return signOut({ callbackUrl: "/login" });
}
