"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { INPUT } from "./styles";

export function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  example,
  required,
  type = "text",
}: {
  name: string;
  label: Text;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  placeholder?: Text;
  example?: string;
}) {
  const { t } = useLanguage();

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs text-muted">{t(label)}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={example ?? (placeholder === undefined ? undefined : t(placeholder))}
        className={INPUT}
      />
    </label>
  );
}
