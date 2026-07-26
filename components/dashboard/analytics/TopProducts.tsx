"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import type { AnalyticsData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function TopProducts({ rows }: { rows: AnalyticsData["topProducts"] }) {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <h3 className="mb-3.5 text-[15px] font-semibold">
        {t({ ka: "ტოპ პროდუქტები", en: "Top products" })}
      </h3>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {t({ ka: "ამ პერიოდში გაყიდვა არ ყოფილა", en: "No sales in this period" })}
        </p>
      ) : (
        <div className="grid gap-1">
          {rows.map((r) => (
            <div key={r.rank} className="flex items-center gap-3 rounded-[8px] px-2 py-2.5 text-sm hover:bg-soft">
              <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-soft text-xs font-semibold text-muted">
                {r.rank}
              </span>
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              <span className="shrink-0 text-xs text-muted">
                ×{r.sold.toLocaleString("en-US")}
              </span>
              <span className="w-24 shrink-0 text-right font-mono font-medium">
                {r.revenue.toLocaleString("en-US")}₾
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
