"use client";

import clsx from "clsx";
import { Panel } from "@/components/dashboard/ui/Panel";
import { StatusDot } from "@/components/dashboard/ui/StatusDot";
import { CHANNEL_STATUS } from "@/lib/dashboard/home";
import { TONE_TEXT } from "@/lib/dashboard/tone";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Health lights for every connected channel. */
export function ChannelStatusCard() {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <h3 className="mb-3.5 text-[15px] font-semibold">
        {t({ ka: "არხების სტატუსი", en: "Channel status" })}
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {CHANNEL_STATUS.map((c) => (
          <div
            key={c.name}
            className="flex flex-col items-center gap-1.5 rounded-[10px] border border-border2 bg-soft px-2 py-3 text-center"
          >
            <c.icon size={22} className="text-muted" />
            <span className="text-xs font-medium">{c.name}</span>
            <StatusDot tone={c.tone} />
            <span className={clsx("text-[11px]", TONE_TEXT[c.tone])}>{t(c.state)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
