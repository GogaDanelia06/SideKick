"use client";

import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { failures } from "@/lib/site/theme/contrast";
import type { Theme } from "@/lib/site/theme/css";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SHADE_LABEL, SHADES } from "./shades";

/** Lists the text colours that fail their contrast minimum, in either theme. */
export function ContrastNotes({ theme }: { theme: Theme }) {
  const { t } = useLanguage();
  const bad = SHADES.flatMap((shade) => failures(theme[shade]).map((f) => ({ ...f, shade })));

  if (bad.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[12px] text-green">
        <IconCircleCheck size={15} />
        {t({ ka: "ორივე თემაში ყველა ტექსტი იკითხება", en: "Every text colour is readable in both themes" })}
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
          <li key={`${f.shade}-${t(f.label)}`} className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-ink">
              <span className="text-muted">{t(SHADE_LABEL[f.shade])} · </span>
              {t(f.label)}
            </span>
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
