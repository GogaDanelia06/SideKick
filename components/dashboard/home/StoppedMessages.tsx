"use client";

import Link from "next/link";
import { IconMessageOff } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { CHANNEL_META } from "@/lib/dashboard/channelMeta";
import type { HomeOverview } from "@/lib/dashboard/queries";
import { TONE_BADGE } from "@/lib/dashboard/tone";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { phrase } from "@/lib/i18n/messages";

export function StoppedMessages({ items }: { items: HomeOverview["stopped"] }) {
  const { t } = useLanguage();

  const ago = (mins: number): Text => {
    if (mins < 60) return phrase("dashboard.home.stoppedMessages.minutes", { min: mins });
    const h = Math.floor(mins / 60);
    if (h < 24) return phrase("dashboard.home.stoppedMessages.hours", { h });
    const d = Math.floor(h / 24);
    return phrase("dashboard.home.stoppedMessages.days", { d });
  };

  return (
    <Panel className="p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">
          {t("dashboard.home.stoppedMessages.botStatusStoppedMessages")}
        </h3>
        <Link href={DASH.conversations} className="shrink-0 text-[13px] text-blue">
          {t("dashboard.home.stoppedMessages.viewAll")}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <IconMessageOff size={26} className="text-faint" />
          <p className="text-sm text-muted">
            {t("dashboard.home.stoppedMessages.noStoppedMessages")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((m) => {
            const Icon = m.channelType ? CHANNEL_META[m.channelType].icon : IconMessageOff;
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[10px] border border-border2 bg-soft px-3.5 py-3"
              >
                <Icon size={18} className="shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {m.customer ?? t("dashboard.home.stoppedMessages.unknown")}
                  </div>
                  <div className="truncate text-xs text-muted">{m.text}</div>
                </div>
                {m.reason ? (
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_BADGE.amber}`}
                  >
                    {m.reason}
                  </span>
                ) : null}
                <span className="hidden w-14 shrink-0 text-right text-xs text-faint sm:block">
                  {t(ago(m.minutesAgo))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
