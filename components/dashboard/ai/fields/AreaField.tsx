"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { AREA } from "./styles";

export function AreaField({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 4,
}: {
  name: string;
  label?: Text;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
}) {
  const { t } = useLanguage();

  return (
    <label className="block text-sm">
      {label ? <span className="mb-1.5 block text-xs text-muted">{t(label)}</span> : null}
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={AREA} />
    </label>
  );
}
