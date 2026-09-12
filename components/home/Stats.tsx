"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { LiveDot, LiveFigure } from "./LiveFigure";
import type { SiteStatView } from "@/lib/site/content";

/** The strip under the hero; only counted figures get the live dot. */
export function Stats({ stats }: { stats: SiteStatView[] }) {
  const { t } = useLanguage();
  if (stats.length === 0) return null;

  return (
    <div className="mt-11 flex flex-wrap gap-x-16 gap-y-6 border-t border-border pt-8">
      {stats.map((stat, i) => (
        <div key={i}>
          {stat.liveKey && stat.n !== null ? (
            <LiveFigure
              source={stat.liveKey}
              initial={stat.n}
              format={stat.format}
              suffix={stat.suffix}
              className="block font-mono text-[32px] font-medium tabular-nums"
            />
          ) : (
            <div className="font-mono text-[32px] font-medium tabular-nums">
              {stat.value}
              {stat.suffix}
            </div>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            {t(stat.label)}
            {stat.kind === "counted" ? <LiveDot /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
