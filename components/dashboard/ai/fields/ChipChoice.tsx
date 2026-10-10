"use client";

import { IconCheck } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import type { Bilingual } from "@/lib/i18n/types";

export function ChipChoice({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: Text;
  options: Bilingual[];
  value: string | null;
}) {
  const { t } = useLanguage();
  const current = options.find((o) => o.ka === value)?.ka ?? options[0].ka;

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] text-muted">{t(label)}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.ka}
            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-border px-3.5 py-2 text-[13px] transition-colors hover:border-blue has-[:checked]:border-primary has-[:checked]:bg-green-surface has-[:checked]:font-medium has-[:checked]:text-green"
          >
            <input type="radio" name={name} value={o.ka} defaultChecked={o.ka === current} className="peer sr-only" />
            <IconCheck size={14} className="hidden peer-checked:block" />
            {t(o)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
