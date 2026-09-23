"use client";

import clsx from "clsx";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import type { AnalyticsData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const META: { key: keyof AnalyticsData["kpis"]; label: Text; money?: boolean }[] = [
  { key: "conversations", label: "dashboard.analytics.kpis.conversations" },
  { key: "leads", label: "dashboard.analytics.kpis.leads" },
  { key: "orders", label: "dashboard.analytics.kpis.sales" },
  { key: "revenue", label: "dashboard.analytics.kpis.revenue", money: true },
];

export function AnalyticsKpis({ kpis }: { kpis: AnalyticsData["kpis"] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {META.map((m) => {
        const { value, deltaPct } = kpis[m.key];
        const up = (deltaPct ?? 0) >= 0;
        const Trend = up ? IconTrendingUp : IconTrendingDown;
        return (
          <Panel key={m.key} className="p-[18px]">
            <div className="text-[13px] text-muted">{t(m.label)}</div>
            <div className="mt-2 font-mono text-[28px] font-semibold">
              {value.toLocaleString("en-US")}{m.money ? "₾" : ""}
            </div>
            {deltaPct === null ? (
              <div className="mt-1 text-xs text-faint">
                {t("dashboard.analytics.kpis.noPreviousPeriod")}
              </div>
            ) : (
              <div className={clsx("mt-1 flex items-center gap-1 text-xs", up ? "text-green" : "text-red")}>
                <Trend size={14} />{up ? "+" : ""}{deltaPct}%
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
