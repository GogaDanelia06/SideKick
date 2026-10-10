"use client";

import clsx from "clsx";
import { CHANNEL_META } from "@/lib/dashboard/channelMeta";
import type { ConversationRow } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ago, ALERT, RING } from "./listConfig";

export function ChatRow({
  conversation: c,
  selected,
  onSelect,
}: {
  conversation: ConversationRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLanguage();
  const al = c.alert !== "none" ? ALERT[c.alert] : null;
  const m = c.channelType ? CHANNEL_META[c.channelType] : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "flex w-full gap-3 border-b border-l-[3px] border-border2 px-3.5 py-3 text-left",
        selected ? "border-l-primary bg-blue-surface" : "border-l-transparent",
      )}
    >
      <span className="relative shrink-0">
        <span
          className={clsx(
            "grid size-[38px] place-items-center rounded-full border-2 bg-soft font-semibold text-muted",
            RING[c.ring],
          )}
        >
          {c.initials}
        </span>
        {m ? (
          <span className="absolute -bottom-1 -right-1 grid size-[18px] place-items-center rounded-full border border-border bg-surface">
            <m.icon size={12} style={{ color: m.color }} />
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span title={c.name} className="min-w-0 truncate text-[13px] font-semibold">
            {c.name}
          </span>
          {al ? (
            <span className={clsx("grid size-[17px] shrink-0 place-items-center rounded-full", al.cls)}>
              <al.icon size={12} />
            </span>
          ) : null}
          <span className="ml-auto shrink-0 pl-1 text-[11px] text-faint">{t(ago(c.minutesAgo))}</span>
        </span>
        <span className="block truncate text-xs text-muted">{c.preview}</span>
      </span>
    </button>
  );
}
