"use client";

import { AUTH_OR } from "@/lib/content/auth";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function OrDivider() {
  const { t } = useLanguage();
  return (
    <div className="mb-[18px] flex items-center gap-3 text-[12px] text-muted">
      <span className="h-px flex-1 bg-border" />
      {t(AUTH_OR)}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
