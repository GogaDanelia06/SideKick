"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import clsx from "clsx";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

export const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
export const AREA =
  "w-full rounded-[8px] border border-input bg-canvas p-3 text-sm outline-none placeholder:text-faint focus:border-blue";

/** Short-lived "Saved" confirmation after a successful write. */
function useSavedFlag(ms = 2500): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const trigger = useCallback(() => {
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);

  return [on, trigger];
}

/** Section heading with its icon, matching the panel titles in the design. */
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

/**
 * Section wrapper: heading + its own save button. Each section saves
 * independently so a long settings screen can't lose work in one big submit.
 */
export function SectionForm({
  icon,
  title,
  hint,
  right,
  action,
  saveLabel,
  extraActions,
  children,
}: {
  icon: IconType;
  title: Bilingual;
  hint?: Bilingual;
  right?: ReactNode;
  action: (data: FormData) => Promise<void>;
  saveLabel?: Bilingual;
  extraActions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [saved, markSaved] = useSavedFlag();

  return (
    <form
      action={(fd) =>
        start(async () => {
          await action(fd);
          markSaved();
        })
      }
      className="flex flex-col gap-5"
    >
      <SectionHead icon={icon} title={title} hint={hint} right={right} />

      {children}

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-primary px-5 text-[13px] font-medium text-white disabled:opacity-60"
        >
          <IconCheck size={16} />
          {pending ? "…" : t(saveLabel ?? { ka: "შენახვა", en: "Save" })}
        </button>
        {extraActions}
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-green">
            <IconCheck size={16} /> {t({ ka: "შენახულია", en: "Saved" })}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function TextField({
  name, label, defaultValue, placeholder, required, type = "text",
}: {
  name: string; label: Bilingual; defaultValue?: string | null;
  placeholder?: string; required?: boolean; type?: string;
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
        placeholder={placeholder}
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

/**
 * Selectable chips backed by a hidden radio group, so the choice posts with the
 * form. The selected chip shows a check, as in the design.
 */
export function ChipChoice({
  name, label, options, value,
}: {
  name: string; label: Bilingual; options: string[]; value: string | null;
}) {
  const { t } = useLanguage();
  const current = value && options.includes(value) ? value : options[0];

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] text-muted">{t(label)}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-border px-3.5 py-2 text-[13px] transition-colors hover:border-blue has-[:checked]:border-primary has-[:checked]:bg-green-surface has-[:checked]:font-medium has-[:checked]:text-green"
          >
            <input type="radio" name={name} value={o} defaultChecked={o === current} className="peer sr-only" />
            <IconCheck size={14} className="hidden peer-checked:block" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Banner for features that depend on the (not yet commissioned) AI module. */
export function AiModuleNotice({ text }: { text: Bilingual }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-ai bg-ai-surface px-3.5 py-3 text-[13px] text-ai">
      <IconSparkles size={17} className="mt-px shrink-0" />
      <span>{t(text)}</span>
    </div>
  );
}

/** Checkbox styled as a labelled row, used by the behaviour rules. */
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
