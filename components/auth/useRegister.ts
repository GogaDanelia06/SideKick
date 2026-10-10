import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth/browserSignIn";
import { refusalMessage } from "@/lib/auth/messages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { readRegisterForm, validateRegister, type RegisterErrors, type RegisterField } from "./registerValidation";

export function useRegister() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const values = readRegisterForm(new FormData(event.currentTarget));
    const errors = validateRegister(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    const { firstName, lastName, email, password, phone, company, field } = values;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phone, company, field }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        setError(t(refusalMessage(data, "auth.registerForm.registrationFailed")));
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.verify) {
        setPendingEmail(email);
        setNeedsVerification(true);
        return;
      }

      const signInResult = await signIn("credentials", { email, password, redirect: false });

      if (!signInResult?.ok || signInResult.error) {
        setError(t("auth.registerForm.registrationCompletedPleaseSign"));
        return;
      }

      setSent(true);
    } catch {
      setError(t("auth.registerForm.aNetworkErrorOccurred"));
    } finally {
      setPending(false);
    }
  }

  return { sent, needsVerification, pendingEmail, error, fieldErrors, pending, onSubmit, clearFieldError };
}
