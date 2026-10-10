"use client";

import { signIn } from "next-auth/react";
import { accountsRequest } from "./accountsClient";

export { signIn };

export async function signInWithGoogle(callbackUrl: string) {
  await accountsRequest("add");
  await signIn("google", { callbackUrl });
}
