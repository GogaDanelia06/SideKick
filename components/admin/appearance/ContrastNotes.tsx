"use client";

import { IconAlertTriangle, IconChevronDown, IconCircleCheck } from "@tabler/icons-react";
import { failures } from "@/lib/site/theme/contrast";
import type { Theme } from "@/lib/site/theme/css";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SHADE_LABEL, SHADES } from "./shades";

/** One line for the save bar; the text colours that fail their contrast minimum open as a list. */
export function ContrastNotes({ theme }: { theme: Theme }) {
  const { t } = useLanguage();
  const bad = SHADES.flatMap((shade) => failures(theme[shade]).map((f) => ({ ...f, shade })));

  if (bad.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[12px] text-green">
        <IconCircleCheck size={15} className="shrink-0" />
        {t("admin.appearance.contrastNotes.everyTextColourIs")}
      </p>
    );
  }

  return (
    <details className="group text-[12px]">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 font-semibold text-amber">
        <IconAlertTriangle size={15} className="shrink-0" />
        {t("admin.appearance.contrastNotes.hardToRead", { count: bad.length })}
        <IconChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-2 flex flex-col gap-1 rounded-lg border border-amber/40 bg-amber-surface p-2.5">
        {bad.map((f) => (
          <li key={`${f.shade}-${t(f.label)}`} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-ink">
              <span className="text-muted">{t(SHADE_LABEL[f.shade])} · </span>
              {t(f.label)}
            </span>
            <span className="font-mono text-[11px] text-muted">
              {f.ratio.toFixed(1)} : 1 · {t("admin.appearance.contrastNotes.needs")} {f.min}
            </span>
          </li>
        ))}
        <li className="pt-1 text-[11px] text-muted">
          {t("admin.appearance.contrastNotes.youCanStillSave")}
        </li>
      </ul>
    </details>
  );
}
