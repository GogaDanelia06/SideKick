"use client";

import type { ComponentProps, FormEventHandler } from "react";
import { IconMailFast } from "@tabler/icons-react";
import { Field } from "@/components/ui/Field";
import { REGISTER } from "@/lib/content/auth";
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { RegisterErrors, RegisterField } from "./registerValidation";

type Props = {
  errors: RegisterErrors;
  onClear: (field: RegisterField) => void;
  error: string | null;
  pending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

function RegisterInput({
  name,
  errors,
  onClear,
  ...field
}: { name: RegisterField; errors: RegisterErrors; onClear: Props["onClear"] } & Omit<
  ComponentProps<typeof Field>,
  "name" | "error" | "onChange"
>) {
  const { t } = useLanguage();
  const problem = errors[name];

  return <Field name={name} error={problem ? t(AUTH_MESSAGES[problem]) : undefined} onChange={() => onClear(name)} {...field} />;
}

export function RegisterFields({ errors, onClear, error, pending, onSubmit }: Props) {
  const { t } = useLanguage();
  const input = { errors, onClear };

  return (
    <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RegisterInput {...input} name="firstName" label={t(REGISTER.firstName)} type="text" autoComplete="given-name" required />
        <RegisterInput {...input} name="lastName" label={t(REGISTER.lastName)} type="text" autoComplete="family-name" />
      </div>

      <RegisterInput {...input} name="email" label={t(REGISTER.email)} type="email" autoComplete="email" required />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RegisterInput {...input} name="password" label={t(REGISTER.password)} type="password" autoComplete="new-password" required />
        <RegisterInput
          {...input}
          name="repeatPassword"
          label={t(REGISTER.repeatPassword)}
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      <RegisterInput {...input} name="phone" label={t(REGISTER.phone)} type="tel" autoComplete="tel" />
      <RegisterInput
        {...input}
        name="company"
        label={t(REGISTER.company)}
        hint={t(REGISTER.optional)}
        type="text"
        autoComplete="organization"
      />
      <RegisterInput {...input} name="field" label={t(REGISTER.industry)} hint={t(REGISTER.optional)} type="text" />

      {error ? <p className="text-[13px] text-red">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <IconMailFast size={18} />
        {pending ? "…" : t(REGISTER.submit)}
      </button>
    </form>
  );
}
