"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginField = "email" | "password";
type LoginErrorKey = "emailRequired" | "emailInvalid" | "passwordRequired";
type LoginErrors = Partial<Record<LoginField, LoginErrorKey>>;

const LOGIN_VALIDATION_MESSAGES = {
  emailRequired: { ka: "ელფოსტა სავალდებულოა", en: "Email is required" },
  emailInvalid: { ka: "შეიყვანეთ სწორი ელფოსტა", en: "Enter a valid email address" },
  passwordRequired: { ka: "პაროლი სავალდებულოა", en: "Password is required" },
} as const;

type LoginFormProps = {
  google: boolean;
};

export function LoginForm({ google }: LoginFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [pending, setPending] = useState(false);

  const requested = searchParams.get("callbackUrl");
  const callbackUrl = requested?.startsWith("/") ? requested : DASH.home;

  function clearFieldError(field: LoginField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const errors: LoginErrors = {};

    if (!email) errors.email = "emailRequired";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "emailInvalid";

    if (!password) errors.password = "passwordRequired";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (!res?.ok || res.error) {
        return setError(
          t(res?.code === "rate_limited" ? LOGIN.rateLimited : LOGIN.invalid),
        );
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t(LOGIN.invalid));
    } finally {
      setPending(false);
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
      {google ? (
        <>
          <GoogleButton
            label={t(LOGIN.google)}
            onClick={() => signIn("google", { callbackUrl })}
          />

          <OrDivider />
        </>
      ) : null}

      <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
        <Field
          name="email"
          label={t(LOGIN.email)}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={fieldErrors.email ? t(LOGIN_VALIDATION_MESSAGES[fieldErrors.email]) : undefined}
          onChange={() => clearFieldError("email")}
          required
        />

        <Field
          name="password"
          label={t(LOGIN.password)}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={fieldErrors.password ? t(LOGIN_VALIDATION_MESSAGES[fieldErrors.password]) : undefined}
          onChange={() => clearFieldError("password")}
          required
        />

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
          className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "…" : t(LOGIN.submit)}
        </button>
      </form>
    </AuthShell>
  );
}
