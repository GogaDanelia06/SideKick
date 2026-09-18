"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

export const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
export const AREA =
  "w-full rounded-[8px] border border-input bg-canvas p-3 text-sm outline-none placeholder:text-faint focus:border-blue";

export function SectionHead({
  icon: Icon,
  title,
  hint,
  right,
}: {
  icon: IconType;
  title: Bilingual;
  hint?: Bilingual;
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

export function TextField({
  name, label, defaultValue, placeholder, required, type = "text",
}: {
  name: string; label: Bilingual; defaultValue?: string | null;
  placeholder?: string | Bilingual; required?: boolean; type?: string;
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
        placeholder={typeof placeholder === "object" ? t(placeholder) : placeholder}
        className={INPUT}
      />
    </label>
  );
}

export function AreaField({
  name, label, defaultValue, placeholder, rows = 4,
}: {
  name: string; label?: Bilingual; defaultValue?: string | null; placeholder?: string; rows?: number;
}) {
  const { t } = useLanguage();
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1.5 block text-xs text-muted">{t(label)}</span> : null}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={AREA}
      />
    </label>
  );
}

export function ChipChoice({
  name, label, options, value,
}: {
  name: string; label: Bilingual; options: Bilingual[]; value: string | null;
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

export function AiModuleNotice({ text }: { text: Bilingual }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-ai bg-ai-surface px-3.5 py-3 text-[13px] text-ai">
      <IconSparkles size={17} className="mt-px shrink-0" />
      <span>{t(text)}</span>
    </div>
  );
}

export function CheckRow({
  name, label, defaultChecked, className,
}: {
  name: string; label: ReactNode; defaultChecked?: boolean; className?: string;
}) {
  return (
    <label className={clsx("flex cursor-pointer items-center gap-2.5 text-[13px] font-medium", className)}>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}
