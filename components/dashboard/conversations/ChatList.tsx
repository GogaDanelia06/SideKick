"use client";

import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import { IconExclamationMark, IconInbox, IconRobotOff } from "@tabler/icons-react";
import { CHANNEL_META, CHANNEL_ORDER } from "@/lib/dashboard/channelMeta";
import type { ConversationRow } from "@/lib/dashboard/queries";
import type { Bilingual, IconType } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const RING: Record<ConversationRow["ring"], string> = {
  lead: "border-amber",
  order: "border-green",
  none: "border-border",
};
const ALERT: Record<"wait" | "aierr" | "aioff", { icon: IconType; cls: string }> = {
  wait: { icon: IconExclamationMark, cls: "bg-red-surface text-red" },
  aierr: { icon: IconExclamationMark, cls: "bg-amber-surface text-amber" },
  aioff: { icon: IconRobotOff, cls: "bg-soft text-muted" },
};

/**
 * What the rings and badges on each row mean.
 *
 * Built from the same `RING` and `ALERT` maps the rows use, so a colour cannot
 * be changed in one place and explained wrongly in the other. Without this the
 * marks are just colours: nothing on the screen said that an orange ring meant
 * a lead.
 */
const LEGEND: { cls: string; icon?: IconType; label: Bilingual }[] = [
  { cls: RING.lead, label: { ka: "ლიდი", en: "Lead" } },
  { cls: RING.order, label: { ka: "შეკვეთა", en: "Order" } },
  { cls: ALERT.wait.cls, icon: ALERT.wait.icon, label: { ka: "ელოდება ადამიანს", en: "Waiting for a human" } },
  { cls: ALERT.aierr.cls, icon: ALERT.aierr.icon, label: { ka: "AI შეცდომა", en: "AI error" } },
  { cls: ALERT.aioff.cls, icon: ALERT.aioff.icon, label: { ka: "AI გათიშული", en: "AI off" } },
];

function ago(mins: number): Bilingual {
  if (mins < 1) return { ka: "ახლა", en: "now" };
  if (mins < 60) return { ka: `${mins} წთ`, en: `${mins} min` };
  const h = Math.floor(mins / 60);
  if (h < 24) return { ka: `${h} სთ`, en: `${h} h` };
  return { ka: `${Math.floor(h / 24)} დღე`, en: `${Math.floor(h / 24)} d` };
}

export function ChatList({
  conversations,
  selectedId,
  channel,
  onSelect,
  onChannel,
}: {
  conversations: ConversationRow[];
  selectedId: string | null;
  channel: ChannelType | null;
  onSelect: (id: string) => void;
  onChannel: (c: ChannelType | null) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap gap-1.5 border-b border-border2 p-3">
        <button
          type="button"
          onClick={() => onChannel(null)}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            channel === null ? "border-ink bg-ink text-surface" : "border-border bg-soft text-muted",
          )}
        >
          <IconInbox size={13} /> {t({ ka: "ყველა", en: "All" })}
        </button>
        {CHANNEL_ORDER.map((c) => {
          const m = CHANNEL_META[c];
          const on = channel === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChannel(c)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                on ? "border-ink bg-ink text-surface" : "border-border bg-soft text-muted",
              )}
            >
              <m.icon size={13} style={on ? undefined : { color: m.color }} /> {m.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border2 px-3 py-2">
        {LEGEND.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            {item.icon ? (
              <span className={clsx("grid size-[14px] place-items-center rounded-full", item.cls)}>
                <item.icon size={9} />
              </span>
            ) : (
              <span className={clsx("size-[11px] rounded-full border-2", item.cls)} />
            )}
            {t(item.label)}
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <IconInbox size={26} className="text-faint" />
            <p className="text-sm font-medium">
              {t({ ka: "მიმოწერა ჯერ არ არის", en: "No conversations yet" })}
            </p>
            <p className="max-w-[240px] text-xs text-muted">
              {t({
                ka: "შეტყობინებები აქ გამოჩნდება, როგორც კი არხი დაუკავშირდება (Facebook, Instagram, WhatsApp).",
                en: "Messages appear here as soon as a channel is connected (Facebook, Instagram, WhatsApp).",
              })}
            </p>
          </div>
        ) : (
          conversations.map((c) => {
            const al = c.alert !== "none" ? ALERT[c.alert] : null;
            const m = c.channelType ? CHANNEL_META[c.channelType] : null;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={clsx(
                  "flex w-full gap-3 border-b border-l-[3px] border-border2 px-3.5 py-3 text-left",
                  selectedId === c.id ? "border-l-primary bg-blue-surface" : "border-l-transparent",
                )}
              >
                <span className="relative shrink-0">
                  <span className={clsx("grid size-[38px] place-items-center rounded-full border-2 bg-soft font-semibold text-muted", RING[c.ring])}>
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
                    <span className="text-[13px] font-semibold">{c.name}</span>
                    {al ? (
                      <span className={clsx("grid size-[17px] place-items-center rounded-full", al.cls)}>
                        <al.icon size={12} />
                      </span>
                    ) : null}
                    <span className="ml-auto text-[11px] text-faint">{t(ago(c.minutesAgo))}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">{c.preview}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
