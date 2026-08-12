"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  IconArrowRight,
  IconMailCheck,
  IconMailFast,
} from "@tabler/icons-react";

import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { ResendVerification } from "./ResendVerification";
import { Field } from "@/components/ui/Field";
import { REGISTER } from "@/lib/content/auth";
import { safeCallbackUrl } from "@/lib/auth/callbackUrl";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { RegisterTrialNotice } from "./RegisterTrialNotice";

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
  const searchParams = useSearchParams();

  /**
   * Where to land once the account exists.
   *
   * `/start` — what the pricing page's "get started" button goes through —
   * sends `?callbackUrl=/dashboard/billing`, because somebody who just picked a
   * plan is trying to pay for it. This form used to ignore the parameter and
   * push the dashboard home instead, so the plan they chose was dropped on the
   * floor and they arrived somewhere they had not asked for.
   */
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const [sent, setSent] = useState(false);
  /** Registered, but waiting on the customer to open the link we emailed. */
  const [needsVerification, setNeedsVerification] = useState(false);
  // Shown back to them, and used by the resend button. A mistyped address is
  // the commonest reason the mail "never arrives", and it is invisible unless
  // the address is put in front of them.
  const [pendingEmail, setPendingEmail] = useState("");
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

      // The server says whether it sent a confirmation link. When it did, the
      // account is meant to stay shut until the customer opens it — so signing
      // in here would be asking for a refusal we already know is coming, and
      // reporting that refusal as if the registration had gone wrong.
      const data = await res.json().catch(() => ({}));
      if (data.verify) {
        setPendingEmail(email);
        setNeedsVerification(true);
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
      <RegisterTrialNotice />
      {google ? (
        <>
          <GoogleButton
            label={t(REGISTER.google)}
            onClick={() => signIn("google", { callbackUrl })}
          />
          <OrDivider />
        </>
      ) : null}

      {needsVerification ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
            <IconMailCheck size={22} className="shrink-0 text-green" />
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-blue-ink">{t(REGISTER.checkInbox)}</p>
              <p className="break-all text-sm font-medium text-blue-ink">{pendingEmail}</p>
              <ResendVerification email={pendingEmail} />
            </div>
          </div>

          {/* Sign in, not "go to dashboard": the account does not open until the
              link is used, and a button that cannot work yet reads as a fault
              in the site rather than a step still to do. */}
          {/* Carries the destination across, so someone who opens the link
              later still ends up where they were originally heading. */}
          <Link
            href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm border border-border text-sm font-medium"
          >
            {t(REGISTER.signIn)}
            <IconArrowRight size={18} />
          </Link>
        </div>
      ) : sent ? (
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
              router.push(callbackUrl);
              router.refresh();
            }}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white"
          >
            {/* Not "go to dashboard" any more: the destination now depends on
                where the customer set out from — billing, if they came from a
                plan — and a button that names the wrong screen is its own bug. */}
            {t({ ka: "გაგრძელება", en: "Continue" })}
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
