"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { IconBolt, IconMailFast } from "@tabler/icons-react";

import { AuthShell } from "./AuthShell";
import { RegisterAuthExtras, RegisterFooter } from "./RegisterAuthExtras";
import { RegisterFields } from "./RegisterFields";
import {
  formPayload,
  type RegisterErrors,
  validateRegisterForm,
} from "./registerFormValidation";
import { REGISTER } from "@/lib/content/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = { google: boolean };

export function RegisterForm({ google }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [pending, setPending] = useState(false);

  function clearError(field: keyof RegisterErrors) {
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = formPayload(new FormData(event.currentTarget));
    const validation = validateRegisterForm(data);

    setError(null);
    if (Object.keys(validation).length) return setErrors(validation);

    setErrors({});
    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          result.error ??
            t({ ka: "რეგისტრაცია ვერ მოხერხდა", en: "Registration failed" }),
        );
        return;
      }

      if (result.verify) {
        router.replace(ROUTES.login);
        router.refresh();
        return;
      }

      const login = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.replace(login?.ok && !login.error ? DASH.home : ROUTES.login);
      router.refresh();
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
      footer={<RegisterFooter />}
    >
      <RegisterAuthExtras google={google} />
      <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
        <RegisterFields errors={errors} onChange={clearError} />
        {error && <p className="text-[13px] text-red">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white disabled:opacity-60"
        >
          <IconMailFast size={18} />
          {pending ? "…" : t(REGISTER.submit)}
        </button>
      </form>
    </AuthShell>
  );
}
