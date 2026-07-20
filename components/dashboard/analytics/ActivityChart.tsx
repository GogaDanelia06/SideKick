"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { CHART_BARS } from "@/lib/dashboard/analytics";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Simple bar chart of conversation volume over the selected range. */
export function ActivityChart({ range }: { range: string }) {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">
          {t({ ka: "მიმოწერების დინამიკა", en: "Conversation trend" })}
        </h3>
        <span className="text-xs text-muted">{range}</span>
      </div>
      <div className="flex h-[180px] items-end gap-2.5">
        {CHART_BARS.map((h, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="w-full rounded-t-[5px] bg-primary opacity-90" style={{ height: `${h}%` }} />
            <span className="text-[10px] text-faint">
              {t({ ka: "დღ", en: "D" })}
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
