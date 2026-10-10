"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { INPUT, LABEL } from "./planForm";

export function PlanNumberField({ name, label, value }: { name: string; label: Text; value: number }) {
  const { t } = useLanguage();

  return (
    <label className="block">
      <span className={LABEL}>{t(label)}</span>
      <input name={name} type="number" defaultValue={value} className={INPUT} />
    </label>
  );
}
