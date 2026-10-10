import { signOut } from "next-auth/react";
import { accountsRequest } from "@/lib/auth/accountsClient";
import { clearAiDrafts } from "@/lib/dashboard/sectionSave/drafts";
import { clearTesterChat } from "@/lib/dashboard/testerChat";

export async function logOut() {
  clearAiDrafts();
  clearTesterChat();
  await accountsRequest("clear");
  return signOut({ callbackUrl: "/login" });
}
