"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  IconArrowRight,
  IconBolt,
  IconMailCheck,
  IconMailFast,
} from "@tabler/icons-react";

import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { Field } from "@/components/ui/Field";
import { REGISTER } from "@/lib/content/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿა-ჰ' -]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const PASSWORD_NUMBER_OR_SYMBOL_PATTERN =
  /[0-9]|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "repeatPassword"
  | "phone"
  | "company"
  | "field";

type RegisterErrorKey =
  | "firstNameRequired"
  | "nameInvalid"
  | "emailRequired"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordLength"
  | "passwordLowercase"
  | "passwordUppercase"
  | "passwordNumberOrSymbol"
  | "repeatRequired"
  | "passwordsMismatch"
  | "phoneInvalid";

type RegisterErrors = Partial<Record<RegisterField, RegisterErrorKey>>;

const REGISTER_VALIDATION_MESSAGES = {
  firstNameRequired: {
    ka: "სახელი სავალდებულოა",
    en: "First name is required",
  },
  nameInvalid: {
    ka: "გამოიყენეთ მხოლოდ ასოები, გამოტოვება, დეფისი ან აპოსტროფი",
    en: "Use only letters, spaces, hyphens, or apostrophes",
  },
  emailRequired: {
    ka: "ელფოსტა სავალდებულოა",
    en: "Email is required",
  },
  emailInvalid: {
    ka: "შეიყვანეთ სწორი ელფოსტა",
    en: "Enter a valid email address",
  },
  passwordRequired: {
    ka: "პაროლი სავალდებულოა",
    en: "Password is required",
  },
  passwordLength: {
    ka: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო",
    en: "Password must be at least 8 characters",
  },
  passwordLowercase: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს",
    en: "Password must contain at least one lowercase letter",
  },
  passwordUppercase: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს",
    en: "Password must contain at least one uppercase letter",
  },
  passwordNumberOrSymbol: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს ან სპეციალურ სიმბოლოს",
    en: "Password must contain at least one number or special character",
  },
  repeatRequired: {
    ka: "გაიმეორეთ პაროლი",
    en: "Please repeat your password",
  },
  passwordsMismatch: {
    ka: "პაროლები არ ემთხვევა",
    en: "Passwords don't match",
  },
  phoneInvalid: {
    ka: "შეიყვანეთ სწორი ტელეფონის ნომერი",
    en: "Enter a valid phone number",
  },
} as const;

type RegisterFormProps = {
  google: boolean;
};

export function RegisterForm({ google }: RegisterFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [pending, setPending] = useState(false);

  function clearFieldError(field: RegisterField) {
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

    const fd = new FormData(event.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const repeatPassword = String(fd.get("repeatPassword") ?? "");
    const phone = String(fd.get("phone") ?? "").trim();
    const company = String(fd.get("company") ?? "").trim();
    const field = String(fd.get("field") ?? "").trim();

    const errors: RegisterErrors = {};

    if (!firstName) {
      errors.firstName = "firstNameRequired";
    } else if (!NAME_PATTERN.test(firstName)) {
      errors.firstName = "nameInvalid";
    }

    if (lastName && !NAME_PATTERN.test(lastName)) {
      errors.lastName = "nameInvalid";
    }

    if (!email) {
      errors.email = "emailRequired";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "emailInvalid";
    }

    if (!password) {
      errors.password = "passwordRequired";
    } else if (password.length < 8) {
      errors.password = "passwordLength";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "passwordLowercase";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "passwordUppercase";
    } else if (!PASSWORD_NUMBER_OR_SYMBOL_PATTERN.test(password)) {
      errors.password = "passwordNumberOrSymbol";
    }

    if (!repeatPassword) {
      errors.repeatPassword = "repeatRequired";
    } else if (password !== repeatPassword) {
      errors.repeatPassword = "passwordsMismatch";
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      errors.phone = "phoneInvalid";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    const payload = {
      firstName,
      lastName,
      email,
      password,
      phone,
      company,
      field,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        setError(
          data.error ??
            t({
              ka: "რეგისტრაცია ვერ მოხერხდა",
              en: "Registration failed",
            }),
        );
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInResult?.ok || signInResult.error) {
        setError(
          t({
            ka: "რეგისტრაცია დასრულდა. გთხოვთ, შეხვიდეთ ანგარიშზე.",
            en: "Registration completed. Please sign in to your account.",
          }),
        );
        return;
      }

      setSent(true);
    } catch {
      setError(
        t({
          ka: "დაფიქსირდა ქსელის შეცდომა. სცადეთ თავიდან.",
          en: "A network error occurred. Please try again.",
        }),
      );
    } finally {
      setPending(false);
    }
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
          <Link href={ROUTES.login} className="font-medium text-blue">
            {t(REGISTER.signIn)}
          </Link>
        </>
      }
    >
      {google ? (
        <>
          <GoogleButton
            label={t(REGISTER.google)}
            onClick={() => signIn("google", { callbackUrl: DASH.home })}
          />
          <OrDivider />
        </>
      ) : null}

      {sent ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
            <IconMailCheck size={22} className="shrink-0 text-green" />
            <p className="text-sm leading-relaxed text-blue-ink">
              {t(REGISTER.sent)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              router.push(DASH.home);
              router.refresh();
            }}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white"
          >
            {t({ ka: "გადადი დეშბორდზე", en: "Go to dashboard" })}
            <IconArrowRight size={18} />
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              name="firstName"
              label={t(REGISTER.firstName)}
              type="text"
              autoComplete="given-name"
              error={
                fieldErrors.firstName
                  ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.firstName])
                  : undefined
              }
              onChange={() => clearFieldError("firstName")}
              required
            />

            <Field
              name="lastName"
              label={t(REGISTER.lastName)}
              type="text"
              autoComplete="family-name"
              error={
                fieldErrors.lastName
                  ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.lastName])
                  : undefined
              }
              onChange={() => clearFieldError("lastName")}
            />
          </div>

          <Field
            name="email"
            label={t(REGISTER.email)}
            type="email"
            autoComplete="email"
            error={
              fieldErrors.email
                ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.email])
                : undefined
            }
            onChange={() => clearFieldError("email")}
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              name="password"
              label={t(REGISTER.password)}
              type="password"
              autoComplete="new-password"
              error={
                fieldErrors.password
                  ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.password])
                  : undefined
              }
              onChange={() => clearFieldError("password")}
              required
            />

            <Field
              name="repeatPassword"
              label={t(REGISTER.repeatPassword)}
              type="password"
              autoComplete="new-password"
              error={
                fieldErrors.repeatPassword
                  ? t(
                      REGISTER_VALIDATION_MESSAGES[
                        fieldErrors.repeatPassword
                      ],
                    )
                  : undefined
              }
              onChange={() => clearFieldError("repeatPassword")}
              required
            />
          </div>

          <Field
            name="phone"
            label={t(REGISTER.phone)}
            type="tel"
            autoComplete="tel"
            error={
              fieldErrors.phone
                ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.phone])
                : undefined
            }
            onChange={() => clearFieldError("phone")}
          />

          <Field
            name="company"
            label={t(REGISTER.company)}
            hint={t(REGISTER.optional)}
            type="text"
            autoComplete="organization"
            error={
              fieldErrors.company
                ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.company])
                : undefined
            }
            onChange={() => clearFieldError("company")}
          />

          <Field
            name="field"
            label={t(REGISTER.industry)}
            hint={t(REGISTER.optional)}
            type="text"
            error={
              fieldErrors.field
                ? t(REGISTER_VALIDATION_MESSAGES[fieldErrors.field])
                : undefined
            }
            onChange={() => clearFieldError("field")}
          />

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
      )}
    </AuthShell>
  );
}
