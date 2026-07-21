"use client";

import Link from "next/link";
import { IconMessageOff } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { CHANNEL_META } from "@/lib/dashboard/home";
import type { HomeOverview } from "@/lib/dashboard/queries";
import { TONE_BADGE } from "@/lib/dashboard/tone";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

/** Conversations the bot handed off and why — the overview's action list. */
export function StoppedMessages({ items }: { items: HomeOverview["stopped"] }) {
  const { t } = useLanguage();

  const ago = (mins: number): Bilingual => {
    if (mins < 60) return { ka: `${mins} წთ`, en: `${mins} min` };
    const h = Math.floor(mins / 60);
    if (h < 24) return { ka: `${h} სთ`, en: `${h} h` };
    const d = Math.floor(h / 24);
    return { ka: `${d} დღე`, en: `${d} d` };
  };

  return (
    <Panel className="p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">
          {t({ ka: "ბოტის სტატუსი — გაჩერებული შეტყობინებები", en: "Bot status — stopped messages" })}
        </h3>
        <Link href={DASH.conversations} className="shrink-0 text-[13px] text-blue">
          {t({ ka: "ყველას ნახვა →", en: "View all →" })}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <IconMessageOff size={26} className="text-faint" />
          <p className="text-sm text-muted">
            {t({ ka: "გაჩერებული შეტყობინება არ არის", en: "No stopped messages" })}
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
                    {m.customer ?? t({ ka: "უცნობი", en: "Unknown" })}
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
