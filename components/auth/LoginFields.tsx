"use client";

import Link from "next/link";
import type { FormEventHandler } from "react";
import { Field } from "@/components/ui/Field";
import { LOGIN } from "@/lib/content/auth";
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ResendVerification } from "./ResendVerification";
import type { LoginErrors, LoginField } from "./loginValidation";

type Props = {
  defaultEmail: string | undefined;
  errors: LoginErrors;
  onClear: (field: LoginField) => void;
  error: string | null;
  unverifiedEmail: string | null;
  pending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function LoginFields({ defaultEmail, errors, onClear, error, unverifiedEmail, pending, onSubmit }: Props) {
  const { t } = useLanguage();

  return (
    <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
      <Field
        name="email"
        label={t(LOGIN.email)}
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        defaultValue={defaultEmail}
        error={errors.email ? t(AUTH_MESSAGES[errors.email]) : undefined}
        onChange={() => onClear("email")}
        required
      />

      <Field
        name="password"
        label={t(LOGIN.password)}
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password ? t(AUTH_MESSAGES[errors.password]) : undefined}
        onChange={() => onClear("password")}
        required
      />

      <div className="flex items-center justify-between text-[13px]">
        <label className="flex items-center gap-2 text-muted">
          <input name="remember" type="checkbox" className="accent-[var(--primary)]" />
          {t(LOGIN.remember)}
        </label>

        <Link href={ROUTES.forgot} className="text-blue">
          {t(LOGIN.forgot)}
        </Link>
      </div>

      {error ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] text-red">{error}</p>
          {unverifiedEmail ? <ResendVerification email={unverifiedEmail} /> : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "…" : t(LOGIN.submit)}
      </button>
    </form>
  );
}
