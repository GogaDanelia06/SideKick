"use client";

import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { failures } from "@/lib/site/theme/contrast";
import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Lists the text colours that fail their contrast minimum. */
export function ContrastNotes({ colors }: { colors: ThemeColors }) {
  const { t } = useLanguage();
  const bad = failures(colors);

  if (bad.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[12px] text-green">
        <IconCircleCheck size={15} />
        {t({ ka: "ყველა ტექსტი იკითხება", en: "Every text colour is readable" })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-amber/40 bg-amber-surface p-3">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-amber">
        <IconAlertTriangle size={15} />
        {t({ ka: "ძნელად იკითხება", en: "Hard to read" })}
      </p>
      <ul className="flex flex-col gap-1">
        {bad.map((f) => (
          <li key={t(f.label)} className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-ink">{t(f.label)}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {f.ratio.toFixed(1)} : 1 · {t({ ka: "საჭიროა", en: "needs" })} {f.min}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted">
        {t({
          ka: "შენახვა მაინც შესაძლებელია — ეს გაფრთხილებაა, არა შეზღუდვა.",
          en: "You can still save — this is a warning, not a limit.",
        })}
      </p>
    </div>
  );
}
