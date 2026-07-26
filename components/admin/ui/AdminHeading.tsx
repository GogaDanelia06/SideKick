"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export function AdminHeading({
  title,
  subtitle,
}: {
  title: Bilingual;
  subtitle?: Bilingual;
}) {
  const { t } = useLanguage();
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold">{t(title)}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{t(subtitle)}</p> : null}
    </div>
  );
}
