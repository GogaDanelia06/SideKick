"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { TOP_PRODUCTS } from "@/lib/dashboard/analytics";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Best-selling products for the period. */
export function TopProducts() {
  const { t } = useLanguage();

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-5 py-3.5 text-sm font-semibold">
        {t({ ka: "ტოპ პროდუქტები", en: "Top products" })}
      </div>
      {TOP_PRODUCTS.map((p) => (
        <div key={p.rank} className="flex items-center gap-3 border-b border-border2 px-5 py-3 text-sm last:border-b-0">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-soft font-mono text-xs font-semibold text-muted">
            {p.rank}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
          <span className="hidden font-mono text-muted sm:block">
            {p.sold} {t({ ka: "გაყ.", en: "sold" })}
          </span>
          <span className="font-mono font-semibold">{p.rev}</span>
        </div>
      ))}
    </Panel>
  );
}
