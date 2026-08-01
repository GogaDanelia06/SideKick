"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { IconArrowRight, IconBolt, IconMailCheck, IconMailFast } from "@tabler/icons-react";
import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { Field } from "@/components/ui/Field";
import { REGISTER } from "@/lib/content/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function RegisterForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to land once the account exists — e.g. /start sends people here with
  // billing as the destination. Only site-relative paths are honoured, so the
  // query string cannot bounce a new customer to another domain.
  const requested = searchParams.get("callbackUrl");
  const callbackUrl = requested?.startsWith("/") ? requested : DASH.home;

  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (password !== String(fd.get("repeatPassword") ?? "")) {
      return setError(t({ ka: "პაროლები არ ემთხვევა", en: "Passwords don't match" }));
    }
    setPending(true);
    const payload = {
      firstName: fd.get("firstName"), lastName: fd.get("lastName"), email: fd.get("email"),
      password, phone: fd.get("phone"), company: fd.get("company"), field: fd.get("field"),
    };
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPending(false);
      return setError(data.error ?? t({ ka: "რეგისტრაცია ვერ მოხერხდა", en: "Registration failed" }));
    }
    await signIn("credentials", { email: String(payload.email), password, redirect: false });
    setPending(false);
    setSent(true);
  }

  return (
    <AuthShell
      icon={IconBolt}
      width={480}
      title={REGISTER.title}
      sub={REGISTER.sub}
      footer={
        <>
          {t(REGISTER.haveAccount)}{" "}
          <Link href={ROUTES.login} className="font-medium text-blue">{t(REGISTER.signIn)}</Link>
        </>
      }
    >
      <GoogleButton label={t(REGISTER.google)} onClick={() => signIn("google", { callbackUrl })} />
      <OrDivider />
      {sent ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
            <IconMailCheck size={22} className="shrink-0 text-green" />
            <p className="text-sm leading-relaxed text-blue-ink">{t(REGISTER.sent)}</p>
          </div>
          <button
            type="button"
            onClick={() => { router.push(callbackUrl); router.refresh(); }}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white"
          >
            {t({ ka: "გადადი დეშბორდზე", en: "Go to dashboard" })}
            <IconArrowRight size={18} />
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field name="firstName" label={t(REGISTER.firstName)} type="text" required />
            <Field name="lastName" label={t(REGISTER.lastName)} type="text" />
          </div>
          <Field name="email" label={t(REGISTER.email)} type="email" required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field name="password" label={t(REGISTER.password)} type="password" required />
            <Field name="repeatPassword" label={t(REGISTER.repeatPassword)} type="password" required />
          </div>
          <Field name="phone" label={t(REGISTER.phone)} type="tel" />
          <Field name="company" label={t(REGISTER.company)} hint={t(REGISTER.optional)} type="text" />
          <Field name="field" label={t(REGISTER.industry)} hint={t(REGISTER.optional)} type="text" />
          {error ? <p className="text-[13px] text-red">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white disabled:opacity-60"
          >
            <IconMailFast size={18} />
            {pending ? "…" : t(REGISTER.submit)}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
