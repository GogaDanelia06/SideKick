import { signOut } from "next-auth/react";
import { clearAiDrafts } from "@/lib/dashboard/autosave/drafts";
import { flushAutosave, stopAutosave } from "@/lib/dashboard/autosave/flush";
import { clearTesterChat } from "@/lib/dashboard/testerChat";

/** Saves what is open, ends the session and forgets what it kept in this browser. */
export async function logOut() {
  await flushAutosave();
  stopAutosave();
  clearAiDrafts();
  clearTesterChat();
  return signOut({ callbackUrl: "/login" });
}
