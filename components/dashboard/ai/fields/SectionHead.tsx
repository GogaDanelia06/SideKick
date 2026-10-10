"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { IconType } from "@/lib/content/types";
import type { Text } from "@/lib/i18n/messages";

export function SectionHead({
  icon: Icon,
  title,
  hint,
  right,
}: {
  icon: IconType;
  title: Text;
  hint?: Text;
  right?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <Icon size={17} className="text-blue" />
          {t(title)}
        </h2>
        {hint ? <p className="mt-1 text-xs text-muted">{t(hint)}</p> : null}
      </div>
      {right}
    </div>
  );
}
