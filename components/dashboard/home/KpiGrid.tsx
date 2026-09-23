"use client";

import Link from "next/link";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import clsx from "clsx";
import { Panel } from "@/components/dashboard/ui/Panel";
import { KPI_META } from "@/lib/dashboard/home";
import type { HomeOverview } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function KpiGrid({ kpis }: { kpis: HomeOverview["kpis"] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_META.map((meta) => {
        const { value, deltaPct } = kpis[meta.key];
        const up = (deltaPct ?? 0) >= 0;
        const Trend = up ? IconTrendingUp : IconTrendingDown;

        return (
          <Link
            key={meta.key}
            href={meta.href}
            className="group rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-blue-ring"
          >
            <Panel className="h-full p-[18px] transition-colors group-hover:border-blue">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">{t(meta.label)}</span>
                <span className="grid size-[34px] place-items-center rounded-[9px] bg-blue-surface text-blue">
                  <meta.icon size={18} />
                </span>
              </div>
              <div className="mt-2.5 font-mono text-[28px] font-semibold">
                {value.toLocaleString("en-US")}
                {meta.money ? "₾" : ""}
              </div>
              {deltaPct === null ? (
                <div className="mt-1 text-xs text-faint">
                  {t("dashboard.home.kpiGrid.noDataForYesterday")}
                </div>
              ) : (
                <div className={clsx("mt-1 flex items-center gap-1 text-xs", up ? "text-green" : "text-red")}>
                  <Trend size={14} />
                  {up ? "+" : ""}
                  {deltaPct}% {t("dashboard.home.kpiGrid.vsYesterday")}
                </div>
              )}
            </Panel>
          </Link>
        );
      })}
    </div>
  );
}
