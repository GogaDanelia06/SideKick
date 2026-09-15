"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { LANGUAGE_FLAGS } from "@/lib/dashboard/aiLanguages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT } from "../parts";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] text-muted hover:border-blue hover:text-ink disabled:opacity-60";

/** Returns whether the language was accepted. */
type Add = (name: string) => boolean;

/** The "add language" button, which opens a name field. */
export function LanguagePicker({
  disabled,
  disabledHint,
  onAdd,
}: {
  disabled: boolean;
  disabledHint: string;
  onAdd: Add;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function close() {
    setOpen(false);
    setDraft("");
  }

  function submit() {
    if (onAdd(draft)) close();
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        onClick={() => setOpen(true)}
        className={`${CHIP} py-2`}
      >
        <IconPlus size={15} />
        {t({ ka: "ენის დამატება", en: "Add language" })}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") close();
        }}
        placeholder={t({ ka: "ენის სახელი", en: "Language name" })}
        className={`${INPUT} h-9 max-w-[180px]`}
      />
      <button
        type="button"
        disabled={!draft.trim()}
        onClick={submit}
        className="inline-flex h-9 items-center rounded-[8px] bg-primary px-3 text-[13px] font-medium text-white disabled:opacity-60"
      >
        {t({ ka: "დამატება", en: "Add" })}
      </button>
    </span>
  );
}

export function SuggestedLanguages({ items, onAdd }: { items: string[]; onAdd: Add }) {
  const { t } = useLanguage();
  if (items.length === 0) return null;

  return (
    <div className="border-t border-border2 pt-4">
      <div className="mb-2 text-xs text-muted">{t({ ka: "შემოთავაზებული", en: "Suggested" })}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((name) => (
          <button key={name} type="button" onClick={() => onAdd(name)} className={`${CHIP} py-1.5`}>
            <IconPlus size={14} />
            {LANGUAGE_FLAGS[name]} {name}
          </button>
        ))}
      </div>
    </div>
  );
}
