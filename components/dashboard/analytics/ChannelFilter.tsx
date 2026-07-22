"use client";

import { useEffect, useState } from "react";
import type { ChannelType } from "@prisma/client";
import {
  IconCheck,
  IconChevronDown,
  IconStack2,
} from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { CHANNEL_META, CHANNEL_ORDER } from "@/lib/dashboard/channelMeta";

const ORDER = CHANNEL_ORDER;

/** "All channels" dropdown — narrows every figure on the page to one channel. */
export function ChannelFilter({
  value,
  onChange,
}: {
  value: ChannelType | null;
  onChange: (next: ChannelType | null) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const all = t({ ka: "ყველა არხი", en: "All channels" });
  const current = value ? CHANNEL_META[value] : null;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-border bg-surface px-3.5 text-[13px] font-medium hover:border-blue"
      >
        {current ? (
          <current.icon size={16} style={{ color: current.color }} />
        ) : (
          <IconStack2 size={16} className="text-muted" />
        )}
        {current ? current.name : all}
        <IconChevronDown size={15} className="text-muted" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-1 w-56 rounded-[10px] border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === null}
            onClick={() => { onChange(null); setOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] hover:bg-soft"
          >
            <IconStack2 size={16} className="text-muted" />
            <span className="flex-1 text-left">{all}</span>
            {value === null ? <IconCheck size={15} className="text-green" /> : null}
          </button>

          {ORDER.map((c) => {
            const m = CHANNEL_META[c];
            const selected = value === c;
            return (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(c); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] hover:bg-soft"
              >
                <m.icon size={16} style={{ color: m.color }} />
                <span className="flex-1 text-left">{m.name}</span>
                {selected ? <IconCheck size={15} className="text-green" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
