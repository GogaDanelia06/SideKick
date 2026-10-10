"use client";

import type { OrderStatus } from "@prisma/client";
import { IconCalendarEvent, IconClock } from "@tabler/icons-react";
import type { OrderRowData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { OrderActions } from "./OrderActions";
import { OrderItems } from "./OrderItems";

const CELL = "rounded-[10px] border border-border bg-surface px-3 py-2.5";
const DASH = "—";

export function OrderDetails({
  order,
  pending,
  onChange,
}: {
  order: OrderRowData;
  pending: boolean;
  onChange: (status: OrderStatus) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 bg-soft p-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-3 text-[13px]">
        <span className="flex items-center gap-1.5 text-muted">
          <IconCalendarEvent size={15} /> {order.dateLabel}
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <IconClock size={15} /> <b className="font-mono text-ink">{order.timeLabel}</b>
        </span>
        <span className="ml-auto text-muted">
          {t("dashboard.orders.row.total")} <b className="font-mono text-base text-ink">{order.total}₾</b>
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className={CELL}>
          <div className="mb-1 text-[11px] text-muted">{t("dashboard.orders.row.name")}</div>
          <div className="text-sm font-medium">{order.customerName ?? DASH}</div>
        </div>
        <div className={CELL}>
          <div className="mb-1 text-[11px] text-muted">{t("dashboard.orders.row.phone")}</div>
          <div className="font-mono text-sm">{order.phone ?? DASH}</div>
        </div>
        <div className={CELL}>
          <div className="mb-1 text-[11px] text-muted">{t("dashboard.orders.row.address")}</div>
          <div className="text-sm">{order.address ?? DASH}</div>
        </div>
      </div>

      {order.items.length > 0 ? <OrderItems items={order.items} /> : null}

      <OrderActions status={order.status} pending={pending} onChange={onChange} />
    </div>
  );
}
