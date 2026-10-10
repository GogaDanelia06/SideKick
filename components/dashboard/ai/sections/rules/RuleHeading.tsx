"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export function Numbered({ n, label }: { n: string; label: Text }) {
  const { t } = useLanguage();

  return (
    <>
      <span className="text-muted">{n}</span> {t(label)}
    </>
  );
}

export function RuleHeading({ n, label }: { n: string; label: Text }) {
  return (
    <div className="mb-2 text-[13px] font-medium">
      <Numbered n={n} label={label} />
    </div>
  );
}
