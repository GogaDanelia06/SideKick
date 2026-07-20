"use client";

import Link from "next/link";
import { IconArrowLeft, IconLockQuestion } from "@tabler/icons-react";
import { AuthShell } from "./AuthShell";
import { Field } from "@/components/ui/Field";
import { FORGOT } from "@/lib/content/auth";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function ForgotForm() {
  const { t } = useLanguage();

  return (
    <AuthShell
      icon={IconLockQuestion}
      iconTone="outline"
      title={FORGOT.title}
      sub={FORGOT.sub}
      footer={
        <Link href={ROUTES.login} className="inline-flex items-center gap-1 font-medium text-blue">
          <IconArrowLeft size={13} />
          {t(FORGOT.back)}
        </Link>
      }
    >
      <form className="flex flex-col gap-3.5" onSubmit={(e) => e.preventDefault()}>
        <Field label={t(FORGOT.email)} type="email" placeholder="you@company.com" />
        <button type="submit" className="h-[42px] rounded-sm bg-primary text-sm font-medium text-white">
          {t(FORGOT.submit)}
        </button>
      </form>
    </AuthShell>
  );
}
