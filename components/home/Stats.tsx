"use client";

import clsx from "clsx";
import { STATS } from "@/lib/content/stats";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Headline metrics below the hero carousel. */
export function Stats() {
  const { t } = useLanguage();

  return (
    <div className="mt-11 flex flex-wrap gap-x-16 gap-y-6 border-t border-border pt-8">
      {STATS.map((stat, i) => (
        <div key={i}>
          <div className="font-mono text-[32px] font-medium">
            {stat.parts.map((part, j) => (
              <span key={j} className={clsx(part.accent && "text-green")}>
                {part.text}
              </span>
            ))}
          </div>
          <div className="mt-1 text-sm text-muted">{t(stat.label)}</div>
        </div>
      ))}
    </div>
  );
}
