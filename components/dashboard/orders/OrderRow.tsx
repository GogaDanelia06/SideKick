"use client";

import clsx from "clsx";
import {
  IconCalendarEvent,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconPrinter,
  IconX,
} from "@tabler/icons-react";
import type { Order } from "@/lib/dashboard/orders";
import { useLanguage } from "@/lib/i18n/useLanguage";

const CELL = "rounded-[10px] border border-border bg-surface px-3 py-2.5";

/** One expandable order row: compact summary that opens to full details. */
export function OrderRow({ order, open, onToggle }: { order: Order; open: boolean; onToggle: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="border-b border-border2 last:border-b-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[13px]">
        <span className="w-16 shrink-0 font-mono font-semibold">{order.id}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{order.name}</span>
        <span className="hidden font-mono text-muted lg:block">{order.phone}</span>
        <span className="font-mono font-semibold">{order.total}</span>
        <span className="hidden shrink-0 text-muted sm:block">{order.date}</span>
        <IconChevronDown size={16} className={clsx("shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="flex flex-col gap-4 bg-soft p-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-3 text-[13px]">
            <span className="flex items-center gap-1.5 text-muted"><IconCalendarEvent size={15} /> {order.date}</span>
            <span className="flex items-center gap-1.5 text-muted"><IconClock size={15} /> <b className="font-mono text-ink">{order.time}</b></span>
            <span className="ml-auto text-muted">{t({ ka: "ჯამი", en: "Total" })} <b className="font-mono text-base text-ink">{order.total}</b></span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "სახელი გვარი", en: "Name" })}</div>
              <div className="text-sm font-medium">{order.name}</div>
            </div>
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "ნომერი", en: "Phone" })}</div>
              <div className="font-mono text-sm">{order.phone}</div>
            </div>
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "მისამართი", en: "Address" })}</div>
              <div className="text-sm">{order.addr}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white">
              <IconCircleCheck size={16} /> {t({ ka: "დადასტურება", en: "Accept" })}
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-border bg-surface px-4 text-[13px] font-medium">
              <IconPrinter size={16} /> {t({ ka: "ბეჭდვა", en: "Print" })}
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-border bg-surface px-4 text-[13px] font-medium text-red">
              <IconX size={16} /> {t({ ka: "გაუქმება", en: "Cancel" })}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
