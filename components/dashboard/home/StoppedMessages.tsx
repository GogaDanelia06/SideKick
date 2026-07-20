"use client";

import Link from "next/link";
import clsx from "clsx";
import { Panel } from "@/components/dashboard/ui/Panel";
import { STOPPED_MSGS } from "@/lib/dashboard/home";
import { TONE_BADGE } from "@/lib/dashboard/tone";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Conversations the bot handed off and why — the overview's action list. */
export function StoppedMessages() {
  const { t } = useLanguage();

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
      <div className="flex flex-col gap-2.5">
        {STOPPED_MSGS.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[10px] border border-border2 bg-soft px-3.5 py-3">
            <m.icon size={18} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{m.user}</div>
              <div className="truncate text-xs text-muted">{m.text}</div>
            </div>
            <span className={clsx("shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_BADGE[m.tone])}>
              {t(m.reason)}
            </span>
            <span className="hidden w-14 shrink-0 text-right text-xs text-faint sm:block">{m.time}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
