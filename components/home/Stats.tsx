"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { LiveDot, LiveFigure } from "./LiveFigure";
import type { SiteStatView } from "@/lib/site/content";

/**
 * The strip under the hero.
 *
 * A stat the platform can count for itself is rendered live and marked as such;
 * one an admin typed is rendered as typed. The two look alike on purpose — the
 * dot is the only difference, because a visitor should not have to care which
 * is which, and an owner should be able to tell at a glance.
 */
export function Stats({ stats }: { stats: SiteStatView[] }) {
  const { t } = useLanguage();
  if (stats.length === 0) return null;

  return (
    <div className="mt-11 flex flex-wrap gap-x-16 gap-y-6 border-t border-border pt-8">
      {stats.map((stat, i) => (
        <div key={i}>
          {stat.source && stat.n !== null ? (
            <LiveFigure
              source={stat.source}
              initial={stat.n}
              format={stat.format}
              className="block font-mono text-[32px] font-medium tabular-nums"
            />
          ) : (
            <div className="font-mono text-[32px] font-medium tabular-nums">{stat.value}</div>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            {t(stat.label)}
            {stat.source && stat.n !== null ? <LiveDot /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
