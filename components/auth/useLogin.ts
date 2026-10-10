import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth/browserSignIn";
import { LOGIN } from "@/lib/content/auth";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { validateLogin, type LoginErrors, type LoginField } from "./loginValidation";

export function useLogin(callbackUrl: string) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  function clearFieldError(field: LoginField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const remember = formData.get("remember") === "on";
    const errors = validateLogin(email, password);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setUnverifiedEmail(null);
    setPending(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        remember: remember ? "1" : "0",
        redirect: false,
      });

      if (!res?.ok || res.error) {
        const unverified = res?.code === "unverified_email";
        const message = unverified
          ? LOGIN.unverified
          : res?.code === "rate_limited"
            ? LOGIN.rateLimited
            : LOGIN.invalid;

        setUnverifiedEmail(unverified ? email : null);
        setPending(false);
        return setError(t(message));
      }

      if (!remember) {
        await fetch("/api/session/remember", { method: "POST" }).catch(() => {});
      }

      window.location.assign(callbackUrl);
    } catch {
      setPending(false);
      setError(t(LOGIN.invalid));
    }
  }

  return { error, fieldErrors, pending, unverifiedEmail, onSubmit, clearFieldError };
}
