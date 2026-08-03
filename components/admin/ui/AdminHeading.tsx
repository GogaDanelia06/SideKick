"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export function AdminHeading({
  title,
  subtitle,
  /** Status or controls that belong beside the title, not under it. */
  aside,
}: {
  title: Bilingual;
  subtitle?: Bilingual;
  aside?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold">{t(title)}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{t(subtitle)}</p> : null}
      </div>
      {aside}
    </div>
  );
}
