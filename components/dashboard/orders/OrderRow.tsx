"use client";

import { useTransition } from "react";
import clsx from "clsx";
import {
  IconCalendarEvent,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconPrinter,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { setOrderStatus } from "@/lib/dashboard/actions";
import type { OrderRowData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

const CELL = "rounded-[10px] border border-border bg-surface px-3 py-2.5";
const BTN = "inline-flex h-9 items-center gap-1.5 rounded-[6px] px-4 text-[13px] font-medium disabled:opacity-60";

/** One expandable order row: compact summary that opens to full details. */
export function OrderRow({
  order,
  open,
  onToggle,
}: {
  order: OrderRowData;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const dash = "—";

  return (
    <div className="border-b border-border2 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[13px]"
      >
        <span className="w-20 shrink-0 font-mono font-semibold">{order.ref}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{order.customerName ?? dash}</span>
        <span className="hidden font-mono text-muted lg:block">{order.phone ?? dash}</span>
        <span className="font-mono font-semibold">{order.total}₾</span>
        <span className="hidden shrink-0 text-muted sm:block">{order.dateLabel}</span>
        <IconChevronDown
          size={16}
          className={clsx("shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-4 bg-soft p-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-3 text-[13px]">
            <span className="flex items-center gap-1.5 text-muted">
              <IconCalendarEvent size={15} /> {order.dateLabel}
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <IconClock size={15} /> <b className="font-mono text-ink">{order.timeLabel}</b>
            </span>
            <span className="ml-auto text-muted">
              {t({ ka: "ჯამი", en: "Total" })}{" "}
              <b className="font-mono text-base text-ink">{order.total}₾</b>
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "სახელი გვარი", en: "Name" })}</div>
              <div className="text-sm font-medium">{order.customerName ?? dash}</div>
            </div>
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "ნომერი", en: "Phone" })}</div>
              <div className="font-mono text-sm">{order.phone ?? dash}</div>
            </div>
            <div className={CELL}>
              <div className="mb-1 text-[11px] text-muted">{t({ ka: "მისამართი", en: "Address" })}</div>
              <div className="text-sm">{order.address ?? dash}</div>
            </div>
          </div>

          {order.items.length > 0 ? (
            <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 border-b border-border2 px-3 py-2.5 text-[13px] last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate">{it.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted">{it.code}</span>
                  <span className="shrink-0 text-muted">×{it.qty}</span>
                  <span className="w-20 shrink-0 text-right font-mono font-semibold">{it.lineTotal}₾</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={pending || order.status === "TO_SEND"}
              onClick={() => start(() => setOrderStatus(order.id, "TO_SEND"))}
              className={`${BTN} bg-primary text-white`}
            >
              <IconTruck size={16} /> {t({ ka: "დადასტურება", en: "Accept" })}
            </button>
            <button
              type="button"
              disabled={pending || order.status === "DONE"}
              onClick={() => start(() => setOrderStatus(order.id, "DONE"))}
              className={`${BTN} border border-border bg-surface text-green`}
            >
              <IconCircleCheck size={16} /> {t({ ka: "დასრულება", en: "Complete" })}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className={`${BTN} border border-border bg-surface`}
            >
              <IconPrinter size={16} /> {t({ ka: "ბეჭდვა", en: "Print" })}
            </button>
            <button
              type="button"
              disabled={pending || order.status === "CANCELLED"}
              onClick={() => start(() => setOrderStatus(order.id, "CANCELLED"))}
              className={`${BTN} border border-border bg-surface text-red`}
            >
              <IconX size={16} /> {t({ ka: "გაუქმება", en: "Cancel" })}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
