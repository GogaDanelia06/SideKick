"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth/browserSignIn";
import { safeCallbackUrl } from "@/lib/auth/callbackUrl";
import { LOGIN } from "@/lib/content/auth";
import { oauthErrorMessage } from "@/lib/content/oauthErrors";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { LoginFields } from "./LoginFields";
import { OrDivider } from "./OrDivider";
import { useLogin } from "./useLogin";

export function LoginForm({ google }: { google: boolean }) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const oauthError = oauthErrorMessage(searchParams.get("error"));
  const login = useLogin(callbackUrl);

  return (
    <AuthShell
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
          <GoogleButton label={t(LOGIN.google)} onClick={() => signInWithGoogle(callbackUrl)} />

          <OrDivider />
        </>
      ) : null}

      <LoginFields
        defaultEmail={searchParams.get("email") ?? undefined}
        errors={login.fieldErrors}
        onClear={login.clearFieldError}
        error={login.error ?? (oauthError ? t(oauthError) : null)}
        unverifiedEmail={login.unverifiedEmail}
        pending={login.pending}
        onSubmit={login.onSubmit}
      />
    </AuthShell>
  );
}
