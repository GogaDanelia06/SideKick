"use client";

import clsx from "clsx";
import { IconChevronDown } from "@tabler/icons-react";
import type { OrderRowData } from "@/lib/dashboard/queries";
import { OrderDetails } from "./OrderDetails";
import { useOrderStatus } from "./useOrderStatus";

const DASH = "—";

export function OrderRow({
  order,
  open,
  onToggle,
}: {
  order: OrderRowData;
  open: boolean;
  onToggle: () => void;
}) {
  const { pending, change } = useOrderStatus(order.id);

  return (
    <div className="border-b border-border2 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[13px]"
      >
        <span className="w-20 shrink-0 font-mono font-semibold">{order.ref}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{order.customerName ?? DASH}</span>
        <span className="hidden font-mono text-muted lg:block">{order.phone ?? DASH}</span>
        <span className="font-mono font-semibold">{order.total}₾</span>
        <span className="hidden shrink-0 text-muted sm:block">{order.dateLabel}</span>
        <IconChevronDown
          size={16}
          className={clsx("shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? <OrderDetails order={order} pending={pending} onChange={change} /> : null}
    </div>
  );
}
