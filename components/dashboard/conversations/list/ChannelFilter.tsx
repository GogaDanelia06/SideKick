"use client";

import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import { IconInbox } from "@tabler/icons-react";
import { CHANNEL_META, CHANNEL_ORDER } from "@/lib/dashboard/channelMeta";
import { useLanguage } from "@/lib/i18n/useLanguage";

const PILL = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium";
const ON = "border-ink bg-ink text-surface";
const OFF = "border-border bg-soft text-muted";

export function ChannelFilter({
  channel,
  onChannel,
}: {
  channel: ChannelType | null;
  onChannel: (c: ChannelType | null) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border2 p-3">
      <button type="button" onClick={() => onChannel(null)} className={clsx(PILL, channel === null ? ON : OFF)}>
        <IconInbox size={13} /> {t("dashboard.conversations.chatList.all")}
      </button>
      {CHANNEL_ORDER.map((c) => {
        const m = CHANNEL_META[c];
        const on = channel === c;
        return (
          <button key={c} type="button" onClick={() => onChannel(c)} className={clsx(PILL, on ? ON : OFF)}>
            <m.icon size={13} style={on ? undefined : { color: m.color }} /> {m.name}
          </button>
        );
      })}
    </div>
  );
}
