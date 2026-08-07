"use client";

import { Field } from "@/components/ui/Field";
import { REGISTER } from "@/lib/content/auth";
import { useLanguage } from "@/lib/i18n/useLanguage";
import {
  REGISTER_VALIDATION_MESSAGES,
  type RegisterErrors,
} from "./registerFormValidation";

type Props = {
  errors: RegisterErrors;
  onChange: (field: keyof RegisterErrors) => void;
};

export function RegisterFields({ errors, onChange }: Props) {
  const { t } = useLanguage();
  const error = (field: keyof RegisterErrors) =>
    errors[field] ? t(REGISTER_VALIDATION_MESSAGES[errors[field]!]) : undefined;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          name="firstName"
          label={t(REGISTER.firstName)}
          autoComplete="given-name"
          error={error("firstName")}
          onChange={() => onChange("firstName")}
          required
        />
        <Field
          name="lastName"
          label={t(REGISTER.lastName)}
          autoComplete="family-name"
          error={error("lastName")}
          onChange={() => onChange("lastName")}
        />
      </div>

      <Field
        name="email"
        label={t(REGISTER.email)}
        type="email"
        autoComplete="email"
        error={error("email")}
        onChange={() => onChange("email")}
        required
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          name="password"
          label={t(REGISTER.password)}
          type="password"
          autoComplete="new-password"
          error={error("password")}
          onChange={() => onChange("password")}
          required
        />
        <Field
          name="repeatPassword"
          label={t(REGISTER.repeatPassword)}
          type="password"
          autoComplete="new-password"
          error={error("repeatPassword")}
          onChange={() => onChange("repeatPassword")}
          required
        />
      </div>

      <Field
        name="phone"
        label={t(REGISTER.phone)}
        type="tel"
        autoComplete="tel"
        error={error("phone")}
        onChange={() => onChange("phone")}
      />
      <Field
        name="company"
        label={t(REGISTER.company)}
        hint={t(REGISTER.optional)}
        autoComplete="organization"
        onChange={() => onChange("company")}
      />
      <Field
        name="field"
        label={t(REGISTER.industry)}
        hint={t(REGISTER.optional)}
        onChange={() => onChange("field")}
      />
    </>
  );
}
