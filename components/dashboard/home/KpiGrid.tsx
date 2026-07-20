"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { KPIS } from "@/lib/dashboard/home";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Four headline metrics at the top of the overview. */
export function KpiGrid() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((k, i) => (
        <Panel key={i} className="p-[18px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">{t(k.label)}</span>
            <span className="grid size-[34px] place-items-center rounded-[9px] bg-blue-surface text-blue">
              <k.icon size={18} />
            </span>
          </div>
          <div className="mt-2.5 font-mono text-[28px] font-semibold">{k.value}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-green">
            <IconTrendingUp size={14} />
            {k.delta} {t({ ka: "დღეს", en: "today" })}
          </div>
        </Panel>
      ))}
    </div>
  );
}
