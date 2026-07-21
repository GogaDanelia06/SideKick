"use client";

import clsx from "clsx";
import { IconExclamationMark, IconRobotOff } from "@tabler/icons-react";
import { CHATS, CONV_FILTERS, type Alert, type Ring } from "@/lib/dashboard/conversations";
import type { IconType } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const RING: Record<Ring, string> = { lead: "border-amber", order: "border-green", none: "border-border" };
const ALERT: Record<Exclude<Alert, "none">, { icon: IconType; cls: string }> = {
  wait: { icon: IconExclamationMark, cls: "bg-red-surface text-red" },
  aierr: { icon: IconExclamationMark, cls: "bg-amber-surface text-amber" },
  aioff: { icon: IconRobotOff, cls: "bg-soft text-muted" },
};

/** Filterable list of conversations; each row selects the detail view. */
export function ChatList({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap gap-1.5 border-b border-border2 p-3">
        {CONV_FILTERS.map((f, i) => (
          <span
            key={i}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              i === 0 ? "border-ink bg-ink text-surface" : "border-border bg-soft text-muted",
            )}
          >
            <f.icon size={13} /> {t(f.label)}
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {CHATS.map((c, i) => {
          const al = c.alert !== "none" ? ALERT[c.alert] : null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={clsx(
                "flex w-full gap-3 border-b border-l-[3px] border-border2 px-3.5 py-3 text-left",
                selected === i ? "border-l-primary bg-blue-surface" : "border-l-transparent",
              )}
            >
              <span className="relative shrink-0">
                <span className={clsx("grid size-[38px] place-items-center rounded-full border-2 bg-soft font-semibold text-muted", RING[c.ring])}>
                  {c.initials}
                </span>
                <span className="absolute -bottom-1 -right-1 grid size-[18px] place-items-center rounded-full border border-border bg-surface">
                  <c.channel size={12} style={{ color: c.channelColor }} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold">{c.name}</span>
                  {al ? (
                    <span className={clsx("grid size-[17px] place-items-center rounded-full", al.cls)}>
                      <al.icon size={12} />
                    </span>
                  ) : null}
                  <span className="ml-auto text-[11px] text-faint">{c.time}</span>
                </span>
                <span className="block truncate text-xs text-muted">{c.preview}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
