"use client";

import { useContext, useId, useMemo, useState } from "react";
import clsx from "clsx";
import { IconChevronDown, IconFileDiff } from "@tabler/icons-react";
import { countChanges, diffText, foldUnchanged, hasChanges } from "@/lib/diff";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionSaveContext } from "../sectionSaveContext";
import { DiffLine } from "./DiffLine";

function Count({ sign, count, label, tone }: { sign: string; count: number; label: string; tone: "added" | "removed" }) {
  if (count === 0) return null;
  return (
    <span
      title={label}
      className={clsx(
        "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold tabular-nums",
        tone === "added" ? "bg-green-surface text-green" : "bg-red-surface text-red",
      )}
    >
      <span aria-hidden>
        {sign}
        {count}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PromptChanges({ saved, current }: { saved: string; current: string }) {
  const { t } = useLanguage();
  const { dirty } = useContext(SectionSaveContext);
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const rows = useMemo(() => diffText(saved, current), [saved, current]);
  const counts = useMemo(() => countChanges(rows), [rows]);
  const shown = useMemo(() => foldUnchanged(rows), [rows]);

  if (!dirty || !saved.trim()) return null;
  if (!hasChanges(rows)) return <p className="text-[13px] text-muted">{t("dashboard.ai.promptChanges.same")}</p>;

  return (
    <section aria-label={t("dashboard.ai.promptChanges.title")} className="overflow-hidden rounded-[10px] border border-border bg-canvas">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        title={t("dashboard.ai.promptChanges.toggle")}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-soft"
      >
        <IconFileDiff size={16} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold">{t("dashboard.ai.promptChanges.title")}</span>
          <span className="block text-[12px] text-muted">{t("dashboard.ai.promptChanges.hint")}</span>
        </span>
        <Count sign="+" count={counts.added} tone="added" label={t("dashboard.ai.promptChanges.wordsAdded", { count: counts.added })} />
        <Count sign="−" count={counts.removed} tone="removed" label={t("dashboard.ai.promptChanges.wordsRemoved", { count: counts.removed })} />
        <IconChevronDown size={16} className={clsx("shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>

      <div id={bodyId} hidden={!open} className="max-h-[340px] overflow-auto border-t border-border2 py-1">
        {shown.map((row, i) => (
          <DiffLine key={i} row={row} />
        ))}
      </div>
    </section>
  );
}
