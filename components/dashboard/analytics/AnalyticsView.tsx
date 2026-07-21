"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import { AnalyticsKpis } from "./AnalyticsKpis";
import { ActivityChart } from "./ActivityChart";
import { ChannelBoxes } from "./ChannelBoxes";
import { TopProducts } from "./TopProducts";
import { ChannelFilter } from "./ChannelFilter";
import { RANGES } from "@/lib/dashboard/analytics";
import type { AnalyticsData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Filters live in the URL so a view can be shared, refreshed, and re-queried
 *  on the server rather than filtered in the browser. */
export function AnalyticsView({
  data,
  rangeIndex,
  channel,
}: {
  data: AnalyticsData;
  rangeIndex: number;
  channel: ChannelType | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  function apply(next: { range?: number; channel?: ChannelType | null }) {
    const q = new URLSearchParams(params.toString());
    if (next.range !== undefined) q.set("range", String(next.range));
    if (next.channel !== undefined) {
      if (next.channel) q.set("channel", next.channel);
      else q.delete("channel");
    }
    router.push(`?${q.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => apply({ range: i })}
              className={clsx(
                "rounded-[6px] border px-3.5 py-1.5 text-[13px] font-medium",
                rangeIndex === i ? "border-ink bg-ink text-surface" : "border-border bg-surface text-ink",
              )}
            >
              {t(r)}
            </button>
          ))}
        </div>

        <ChannelFilter value={channel} onChange={(c) => apply({ channel: c })} />
      </div>

      <AnalyticsKpis kpis={data.kpis} />
      <ActivityChart range={t(RANGES[rangeIndex])} bars={data.bars} />
      <ChannelBoxes channels={data.channels} />
      <TopProducts rows={data.topProducts} />
    </div>
  );
}
