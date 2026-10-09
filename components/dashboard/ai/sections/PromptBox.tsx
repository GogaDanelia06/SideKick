"use client";

import { useRef } from "react";
import clsx from "clsx";
import { Markdown } from "@/components/ui/Markdown";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AREA } from "../parts";

export type PromptView = "preview" | "edit";

const VIEWS = [
  ["preview", "dashboard.ai.promptBox.preview"],
  ["edit", "dashboard.ai.promptBox.edit"],
] as const;

/**
 * The prompt, shown formatted (headings, lists, bold) or as the plain text it is saved as.
 * The textarea stays in the form while the formatted view is open — it is what gets saved —
 * so a change made in one view is always there in the other.
 */
export function PromptBox({
  value,
  onChange,
  view,
  onView,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  view: PromptView;
  onView: (view: PromptView) => void;
  placeholder: string;
}) {
  const { t } = useLanguage();
  const area = useRef<HTMLTextAreaElement>(null);

  function show(next: PromptView) {
    onView(next);
    // The textarea is not on screen until the next paint.
    if (next === "edit") requestAnimationFrame(() => area.current?.focus());
  }

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={t("dashboard.ai.promptBox.view")} className="inline-flex self-end rounded-[8px] border border-border p-0.5 text-[12px]">
        {VIEWS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => show(key)}
            className={clsx(
              "rounded-[6px] px-3 py-1 transition-colors",
              view === key ? "bg-green-surface font-semibold text-green" : "text-muted hover:text-ink",
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>

      <textarea
        ref={area}
        name="prompt"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(AREA, view === "preview" && "hidden")}
      />

      {view === "preview" ? (
        <div className="max-h-[60vh] min-h-[240px] overflow-auto rounded-[8px] border border-input bg-canvas p-4">
          {value.trim() ? <Markdown source={value} /> : <p className="text-sm text-faint">{t("dashboard.ai.promptBox.empty")}</p>}
        </div>
      ) : (
        <p className="text-xs text-muted">{t("dashboard.ai.promptBox.hint")}</p>
      )}
    </div>
  );
}
