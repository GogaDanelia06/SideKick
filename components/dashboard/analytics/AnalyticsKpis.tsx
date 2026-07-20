"use client";

import clsx from "clsx";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { ANALYTICS_KPIS } from "@/lib/dashboard/analytics";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Period totals for the analytics view. */
export function AnalyticsKpis() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ANALYTICS_KPIS.map((k, i) => (
        <Panel key={i} className="p-[18px]">
          <div className="text-[13px] text-muted">{t(k.label)}</div>
          <div className="mt-2 font-mono text-[26px] font-semibold">{k.value}</div>
          <div className={clsx("mt-1 flex items-center gap-1 text-xs", k.up ? "text-green" : "text-red")}>
            {k.up ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
            {k.delta}
          </div>
        </Panel>
      ))}
    </div>
  );
}
