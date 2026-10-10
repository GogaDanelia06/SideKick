"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth/browserSignIn";
import { safeCallbackUrl } from "@/lib/auth/callbackUrl";
import { REGISTER } from "@/lib/content/auth";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AuthShell } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { RegisterFields } from "./RegisterFields";
import { SentNotice, VerifyNotice } from "./RegisterNotices";
import { RegisterTrialNotice } from "./RegisterTrialNotice";
import { useRegister } from "./useRegister";

export function RegisterForm({ google }: { google: boolean }) {
  const { t } = useLanguage();
  const callbackUrl = safeCallbackUrl(useSearchParams().get("callbackUrl"));
  const register = useRegister();

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
          <GoogleButton label={t(REGISTER.google)} onClick={() => signInWithGoogle(callbackUrl)} />
          <OrDivider />
        </>
      ) : null}

      {register.needsVerification ? (
        <VerifyNotice email={register.pendingEmail} callbackUrl={callbackUrl} />
      ) : register.sent ? (
        <SentNotice callbackUrl={callbackUrl} />
      ) : (
        <RegisterFields
          errors={register.fieldErrors}
          onClear={register.clearFieldError}
          error={register.error}
          pending={register.pending}
          onSubmit={register.onSubmit}
        />
      )}
    </AuthShell>
  );
}
