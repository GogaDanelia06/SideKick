"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCircleCheck, IconLock, IconLockQuestion } from "@tabler/icons-react";
import { AuthShell } from "./AuthShell";
import { Field } from "@/components/ui/Field";
import { RESET } from "@/lib/content/auth";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function ResetForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No token in the URL — nothing to do but ask for a fresh link.
  if (!token) {
    return (
      <AuthShell
        icon={IconLockQuestion}
        iconTone="outline"
        title={RESET.title}
        sub={RESET.badLink}
        footer={
          <Link href={ROUTES.forgot} className="font-medium text-blue">
            {t(RESET.requestNew)}
          </Link>
        }
      >
        <p className="rounded-sm border border-red bg-red-surface px-3.5 py-3 text-[13px] text-red">
          {t(RESET.badLink)}
        </p>
      </AuthShell>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: String(fd.get("password") ?? ""),
        repeatPassword: String(fd.get("repeatPassword") ?? ""),
      }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? t({ ka: "ვერ შეიცვალა", en: "Could not change password" }));
    }

    setDone(true);
    setTimeout(() => router.push(ROUTES.login), 2000);
  }

  return (
    <AuthShell
      icon={done ? IconCircleCheck : IconLock}
      iconTone="outline"
      title={RESET.title}
      sub={done ? RESET.done : RESET.sub}
      footer={
        <Link href={ROUTES.login} className="font-medium text-blue">
          {t(RESET.toLogin)}
        </Link>
      }
    >
      {done ? (
        <p className="rounded-sm border border-green bg-green-surface px-3.5 py-3 text-[13px] text-green">
          {t(RESET.done)}
        </p>
      ) : (
        <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
          <Field name="password" label={t(RESET.password)} type="password" placeholder="••••••••" required />
          <Field name="repeatPassword" label={t(RESET.repeat)} type="password" placeholder="••••••••" required />
          <p className="text-[12px] text-muted">{t(RESET.hint)}</p>
          {error ? <p className="text-[13px] text-red">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "…" : t(RESET.submit)}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
