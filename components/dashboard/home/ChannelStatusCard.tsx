"use client";

import clsx from "clsx";
import { Panel } from "@/components/dashboard/ui/Panel";
import { StatusDot } from "@/components/dashboard/ui/StatusDot";
import { CHANNEL_META, CHANNEL_STATE } from "@/lib/dashboard/home";
import type { HomeOverview } from "@/lib/dashboard/queries";
import { TONE_TEXT } from "@/lib/dashboard/tone";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Health lights for every channel on this account — real connection state. */
export function ChannelStatusCard({ channels }: { channels: HomeOverview["channels"] }) {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <h3 className="mb-3.5 text-[15px] font-semibold">
        {t({ ka: "არხების სტატუსი", en: "Channel status" })}
      </h3>
      {channels.length === 0 ? (
        <p className="text-sm text-muted">
          {t({ ka: "არხები ჯერ არ არის დამატებული", en: "No channels yet" })}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {channels.map((c) => {
            const meta = CHANNEL_META[c.type];
            const state = CHANNEL_STATE[c.status];
            return (
              <div
                key={c.id}
                className="flex flex-col items-center gap-1.5 rounded-[10px] border border-border2 bg-soft px-2 py-3 text-center"
              >
                <meta.icon size={22} className="text-muted" />
                <span className="text-xs font-medium">{meta.name}</span>
                <StatusDot tone={state.tone} />
                <span className={clsx("text-[11px]", TONE_TEXT[state.tone])}>{t(state.label)}</span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
