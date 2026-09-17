import { signOut } from "next-auth/react";
import { clearTesterChat } from "@/lib/dashboard/testerChat";

/** Ends the session and forgets what it kept in this browser. */
export function logOut() {
  clearTesterChat();
  return signOut({ callbackUrl: "/login" });
}
