"use client";

import { useState } from "react";
import { LOGIN } from "@/lib/content/auth";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = { email: string };

/**
 * Asks for the confirmation link again.
 *
 * Shown only once sign-in has failed with `unverified_email` — which happens
 * after the password was checked, so offering it here tells a stranger nothing.
 * Without it, one mail lost to a spam folder locks an account forever: signing
 * in is refused until the address is confirmed, and only registration ever
 * issued a link.
 */
export function ResendVerification({ email }: Props) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function resend() {
    setState("sending");
    try {
      await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Swallowed on purpose. The endpoint answers the same for every address,
      // so there is no failure worth reporting that would not also be a hint
      // about whether the account exists.
    }
    // Reported as done either way, and never reset: a button that stays
    // clickable invites someone to send themselves five copies.
    setState("done");
  }

  if (state === "done") {
    return <p className="text-[13px] text-muted">{t(LOGIN.resendDone)}</p>;
  }

  return (
    <button
      type="button"
      onClick={resend}
      disabled={state === "sending"}
      className="self-start text-[13px] text-blue underline-offset-2 hover:underline disabled:opacity-60"
    >
      {state === "sending" ? t(LOGIN.resending) : t(LOGIN.resend)}
    </button>
  );
}
