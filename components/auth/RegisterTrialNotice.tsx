"use client";

import { IconGift } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TRIAL_INFO = {
  ka: "რეგისტრაციის შემდეგ მიიღებთ 5-დღიან სატესტო პერიოდს და 1 თვე უფასო მომსახურებას.",
  en: "After registration, you get a 5-day trial period and 1 month of free service.",
};

export function RegisterTrialNotice() {
  const { t } = useLanguage();

  return (
    <div className="mb-4 flex items-start gap-3 rounded-md border border-blue-ring bg-blue-surface p-4">
      <IconGift size={21} className="mt-0.5 shrink-0 text-green" />

      <p className="text-sm leading-relaxed text-blue-ink">
        {t(TRIAL_INFO)}
      </p>
    </div>
  );
}