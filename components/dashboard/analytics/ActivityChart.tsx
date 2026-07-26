"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function ActivityChart({ range, bars }: { range: string; bars: number[] }) {
  const { t } = useLanguage();
  const max = Math.max(1, ...bars);
  const empty = bars.every((b) => b === 0);

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{t({ ka: "აქტივობა", en: "Activity" })}</h3>
        <span className="text-xs text-muted">{range}</span>
      </div>

      {empty ? (
        <p className="py-10 text-center text-sm text-muted">
          {t({ ka: "ამ პერიოდში მონაცემი არ არის", en: "No data for this period" })}
        </p>
      ) : (
        <div className="flex h-40 items-end gap-2">
          {bars.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="w-full rounded-t-[4px] bg-primary transition-all"
                style={{ height: `${Math.max(4, (b / max) * 100)}%` }}
                title={String(b)}
              />
              <span className="text-[10px] text-faint">{b}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
