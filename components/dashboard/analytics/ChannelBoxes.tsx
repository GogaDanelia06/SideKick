"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { CHANNEL_BOXES } from "@/lib/dashboard/analytics";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** "Most active channel" broken down by revenue, orders and leads. */
export function ChannelBoxes() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CHANNEL_BOXES.map((box, i) => (
        <Panel key={i} className="p-5">
          <div className="mb-3.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <box.icon size={15} className="text-blue" />
            {t({ ka: "ყველაზე აქტიური", en: "Most active" })} — {t(box.label)}
          </div>
          <div className="flex flex-col gap-3">
            {box.rows.map((r, j) => (
              <div key={j} className="flex items-center gap-3">
                <r.icon size={18} style={{ color: r.color }} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span>{r.name}</span>
                    <span className="font-mono text-muted">{r.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                    <span className="block h-full rounded-full" style={{ width: `${r.width}%`, background: r.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
