"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconShoppingCartOff } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { OrderRow } from "./OrderRow";
import { ORDER_TABS } from "@/lib/dashboard/orders";
import type { OrdersData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function OrdersView({ orders, counts }: OrdersData) {
  const { t } = useLanguage();
  const [tab, setTab] = useState(ORDER_TABS[0].key);
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = orders.filter((o) => o.status === tab);

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
            <span className="rounded-full border border-border bg-soft px-2 py-px text-[11px] text-muted">
              {counts[ot.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Panel className="flex flex-col items-center gap-2 p-10 text-center">
          <IconShoppingCartOff size={28} className="text-faint" />
          <p className="text-sm text-muted">
            {t({ ka: "ამ სტატუსით შეკვეთა არ არის", en: "No orders with this status" })}
          </p>
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          {visible.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              open={openId === order.id}
              onToggle={() => setOpenId((cur) => (cur === order.id ? null : order.id))}
            />
          ))}
        </Panel>
      )}
    </div>
  );
}
