"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { IconBolt } from "@tabler/icons-react";
import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { Field } from "@/components/ui/Field";
import { LOGIN } from "@/lib/content/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError(t({ ka: "არასწორი მეილი ან პაროლი", en: "Invalid email or password" }));
    } else {
      router.push(DASH.home);
      router.refresh();
    }
  }

  return (
    <AuthShell
      icon={IconBolt}
      title={LOGIN.title}
      sub={LOGIN.sub}
      footer={
        <>
          {t(LOGIN.noAccount)}{" "}
          <Link href={ROUTES.register} className="font-medium text-blue">
            {t(LOGIN.signUp)}
          </Link>
        </>
      }
    >
      <GoogleButton label={t(LOGIN.google)} onClick={() => signIn("google", { callbackUrl: DASH.home })} />
      <OrDivider />
      <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
        <Field name="email" label={t(LOGIN.email)} type="email" placeholder="you@company.com" required />
        <Field name="password" label={t(LOGIN.password)} type="password" placeholder="••••••••" required />
        <div className="flex items-center justify-between text-[13px]">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="accent-[var(--primary)]" />
            {t(LOGIN.remember)}
          </label>
          <Link href={ROUTES.forgot} className="text-blue">
            {t(LOGIN.forgot)}
          </Link>
        </div>
        {error ? <p className="text-[13px] text-red">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "…" : t(LOGIN.submit)}
        </button>
      </form>
    </AuthShell>
  );
}
