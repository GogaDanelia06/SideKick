"use client";

import { useState } from "react";
import { LOGIN } from "@/lib/content/auth";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = { email: string };

/** Resends the confirmation link; shown only after a correct password for an unverified account. */
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
      // Errors are ignored: the endpoint answers the same for every address.
    }
    // Stays "done" so the button cannot send repeated emails.
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
