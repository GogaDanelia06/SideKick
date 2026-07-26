"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import type { SiteStatView } from "@/lib/site/content";

export function Stats({ stats }: { stats: SiteStatView[] }) {
  const { t } = useLanguage();
  if (stats.length === 0) return null;

  return (
    <div className="mt-11 flex flex-wrap gap-x-16 gap-y-6 border-t border-border pt-8">
      {stats.map((stat, i) => (
        <div key={i}>
          <div className="font-mono text-[32px] font-medium">{stat.value}</div>
          <div className="mt-1 text-sm text-muted">{t(stat.label)}</div>
        </div>
      ))}
    </div>
  );
}
