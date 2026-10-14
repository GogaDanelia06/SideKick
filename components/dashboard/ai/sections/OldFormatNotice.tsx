"use client";

import { IconClockExclamation } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function OldFormatNotice() {
  const { t } = useLanguage();

  return (
    <p className="flex items-start gap-2 rounded-[10px] border border-amber bg-amber-surface px-3.5 py-2.5 text-[13px] text-amber">
      <IconClockExclamation size={16} className="mt-px shrink-0" />
      {t("dashboard.ai.promptSection.oldFormat")}
    </p>
  );
}
