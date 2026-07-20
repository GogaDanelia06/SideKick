"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { LIMIT } from "@/lib/dashboard/home";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Monthly message quota with a usage bar. */
export function LimitCard() {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{t(LIMIT.heading)}</h3>
        <span className="shrink-0 text-xs text-muted">{t(LIMIT.plan)}</span>
      </div>
      <div className="mb-2.5 flex items-end gap-2">
        <span className="font-mono text-[30px] font-semibold">{LIMIT.remaining}</span>
        <span className="mb-1.5 text-[13px] text-muted">{t(LIMIT.used)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-border2 bg-soft">
        <span className="block h-full bg-primary" style={{ width: `${LIMIT.percent}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-faint">
        <span>0</span>
        <span>{t(LIMIT.reset)}</span>
      </div>
    </Panel>
  );
}
