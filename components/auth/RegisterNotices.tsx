"use client";

import Link from "next/link";
import { IconArrowRight, IconMailCheck } from "@tabler/icons-react";
import { REGISTER } from "@/lib/content/auth";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ResendVerification } from "./ResendVerification";

export function VerifyNotice({ email, callbackUrl }: { email: string; callbackUrl: string }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
        <IconMailCheck size={22} className="shrink-0 text-green" />
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-blue-ink">{t(REGISTER.checkInbox)}</p>
          <p className="break-all text-sm font-medium text-blue-ink">{email}</p>
          <ResendVerification email={email} />
        </div>
      </div>

      <Link
        href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm border border-border text-sm font-medium"
      >
        {t(REGISTER.signIn)}
        <IconArrowRight size={18} />
      </Link>
    </div>
  );
}

export function SentNotice({ callbackUrl }: { callbackUrl: string }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
        <IconMailCheck size={22} className="shrink-0 text-green" />
        <p className="text-sm leading-relaxed text-blue-ink">{t(REGISTER.sent)}</p>
      </div>

      <button
        type="button"
        onClick={() => window.location.assign(callbackUrl)}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white"
      >
        {t("auth.registerForm.continue")}
        <IconArrowRight size={18} />
      </button>
    </div>
  );
}
