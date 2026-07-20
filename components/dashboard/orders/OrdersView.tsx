"use client";

import { useState } from "react";
import clsx from "clsx";
import { Panel } from "@/components/dashboard/ui/Panel";
import { OrderRow } from "./OrderRow";
import { ORDER_TABS, ORDERS } from "@/lib/dashboard/orders";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function OrdersView() {
  const { t } = useLanguage();
  const [tab, setTab] = useState(ORDER_TABS[0].key);
  const [openId, setOpenId] = useState<string | null>(ORDERS[0].id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-5 overflow-x-auto border-b border-border">
        {ORDER_TABS.map((ot) => (
          <button
            key={ot.key}
            type="button"
            onClick={() => setTab(ot.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm font-semibold",
              tab === ot.key ? "border-ink text-ink" : "border-transparent text-muted",
            )}
          >
            {t(ot.label)}
            <span className="rounded-full border border-border bg-soft px-2 py-px text-[11px] text-muted">{ot.count}</span>
          </button>
        ))}
      </div>
      <Panel className="overflow-hidden">
        {ORDERS.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            open={openId === order.id}
            onToggle={() => setOpenId((cur) => (cur === order.id ? null : order.id))}
          />
        ))}
      </Panel>
    </div>
  );
}
