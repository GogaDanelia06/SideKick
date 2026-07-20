"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnalyticsKpis } from "./AnalyticsKpis";
import { ActivityChart } from "./ActivityChart";
import { ChannelBoxes } from "./ChannelBoxes";
import { TopProducts } from "./TopProducts";
import { RANGES } from "@/lib/dashboard/analytics";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function AnalyticsView() {
  const { t } = useLanguage();
  const [range, setRange] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRange(i)}
            className={clsx(
              "rounded-[6px] border px-3.5 py-1.5 text-[13px] font-medium",
              range === i ? "border-ink bg-ink text-surface" : "border-border bg-surface text-ink",
            )}
          >
            {t(r)}
          </button>
        ))}
      </div>
      <AnalyticsKpis />
      <ActivityChart range={t(RANGES[range])} />
      <ChannelBoxes />
      <TopProducts />
    </div>
  );
}
