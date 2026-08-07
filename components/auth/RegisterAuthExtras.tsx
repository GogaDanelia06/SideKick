"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { REGISTER } from "@/lib/content/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function RegisterAuthExtras({ google }: { google: boolean }) {
  const { t } = useLanguage();

  if (!google) return null;

  return (
    <>
      <GoogleButton
        label={t(REGISTER.google)}
        onClick={() => signIn("google", { callbackUrl: DASH.home })}
      />
      <OrDivider />
    </>
  );
}

export function RegisterFooter() {
  const { t } = useLanguage();

  return (
    <>
      {t(REGISTER.haveAccount)}{" "}
      <Link href={ROUTES.login} className="font-medium text-blue">
        {t(REGISTER.signIn)}
      </Link>
    </>
  );
}
