"use client";

import clsx from "clsx";
import { IconEye, IconPencil } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export type PromptView = "edit" | "preview";

const TAB = "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-3 text-xs font-medium transition-colors";

export function PromptViewSwitch({ view, onView }: { view: PromptView; onView: (view: PromptView) => void }) {
  const { t } = useLanguage();
  const tab = (value: PromptView) =>
    clsx(TAB, view === value ? "bg-surface text-ink shadow-sm ring-1 ring-border" : "text-muted hover:text-ink");

  return (
    <div
      role="group"
      aria-label={t("dashboard.ai.promptSection.viewLabel")}
      className="inline-flex self-start rounded-[8px] border border-border bg-soft p-0.5"
    >
      <button type="button" aria-pressed={view === "edit"} onClick={() => onView("edit")} className={tab("edit")}>
        <IconPencil size={14} />
        {t("dashboard.ai.promptSection.edit")}
      </button>
      <button type="button" aria-pressed={view === "preview"} onClick={() => onView("preview")} className={tab("preview")}>
        <IconEye size={14} />
        {t("dashboard.ai.promptSection.preview")}
      </button>
    </div>
  );
}
