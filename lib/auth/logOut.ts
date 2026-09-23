import { signOut } from "next-auth/react";
import { accountsRequest } from "@/lib/auth/accountsClient";
import { clearAiDrafts } from "@/lib/dashboard/autosave/drafts";
import { flushAutosave, stopAutosave } from "@/lib/dashboard/autosave/flush";
import { clearTesterChat } from "@/lib/dashboard/testerChat";

/** Saves what is open, ends every session on this browser and forgets what they kept here. */
export async function logOut() {
  await flushAutosave();
  stopAutosave();
  clearAiDrafts();
  clearTesterChat();
  // The other signed-in accounts go too: logging out on a shared computer should leave no one behind.
  await accountsRequest("clear");
  return signOut({ callbackUrl: "/login" });
}
