import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Redirects by session state; destinations are route constants, never request input. */
export async function goByAuth(signedIn: string, guest: string): Promise<never> {
  const session = await auth();
  redirect(session?.user ? signedIn : guest);
}
