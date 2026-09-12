"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconLockQuestion, IconMailCheck } from "@tabler/icons-react";
import { AuthShell } from "./AuthShell";
import { Field } from "@/components/ui/Field";
import { FORGOT } from "@/lib/content/auth";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function ForgotForm() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);
    setPending(true);

    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.code === "not_registered") return setNotRegistered(true);
      return setError(data.error ?? t({ ka: "ვერ გაიგზავნა", en: "Could not send" }));
    }

    setSent(true);
  }

  return (
    <AuthShell
      icon={sent ? IconMailCheck : IconLockQuestion}
      iconTone="outline"
      title={sent ? { ka: "შეამოწმე ფოსტა", en: "Check your email" } : FORGOT.title}
      sub={sent ? FORGOT.sentNote : FORGOT.sub}
      footer={
        <Link href={ROUTES.login} className="inline-flex items-center gap-1 font-medium text-blue">
          <IconArrowLeft size={13} />
          {t(FORGOT.back)}
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-sm border border-green bg-green-surface px-3.5 py-3 text-[13px] text-green">
          {t(FORGOT.sent)}
        </p>
      ) : (
        <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
          <Field
            name="email"
            label={t(FORGOT.email)}
            type="email"
            placeholder="you@company.com"
            required
          />
          {notRegistered ? (
            <p className="text-[13px] text-red">
              {t(FORGOT.notRegistered)}{" "}
              <Link href={ROUTES.register} className="font-medium text-blue underline-offset-2 hover:underline">
                {t(FORGOT.createAccount)}
              </Link>
            </p>
          ) : null}
          {error ? <p className="text-[13px] text-red">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "…" : t(FORGOT.submit)}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
