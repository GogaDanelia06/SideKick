import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Sends a visitor one way or the other depending on whether they are signed in.
 *
 * The alternative — deciding in the button — costs more than it looks. Reading
 * the session in the browser means the markup ships with one destination and
 * then swaps it, so the first thing a returning customer sees is a link to a
 * sign-up form they do not need. Reading it on the page instead makes the whole
 * page's output depend on who is asking, which is the wrong granularity: the
 * marketing pages are identical for everybody except this one link.
 *
 * A route keeps the pages the same for every visitor and puts the decision in
 * the one place that knows the answer. `/start` already worked this way; this
 * is the same idea with the destinations as arguments.
 *
 * Both destinations are literals from our own route table — never anything from
 * the request — so this cannot become an open redirect.
 */
export async function goByAuth(signedIn: string, guest: string): Promise<never> {
  const session = await auth();
  redirect(session?.user ? signedIn : guest);
}
