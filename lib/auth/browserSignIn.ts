"use client";

import { signIn } from "next-auth/react";
import { accountsRequest } from "./accountsClient";

/** Auth.js's own sign-in, used as it comes for the email-and-password form. */
export { signIn };

/**
 * Sends the browser to Google with nobody signed in here.
 *
 * Auth.js attaches a Google account nobody has claimed yet to whoever is signed in at
 * that moment, and the link is permanent: every later sign-in with that Google address
 * would then open the wrong account. Parking the open account first — a no-op when
 * signed out, and refused only when the vault is full — keeps each address to itself.
 * `googleSignInAllowed` on the server refuses whatever still slips through.
 */
export async function signInWithGoogle(callbackUrl: string) {
  await accountsRequest("add");
  await signIn("google", { callbackUrl });
}
