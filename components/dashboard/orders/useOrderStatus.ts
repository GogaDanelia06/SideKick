"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { useToast } from "@/components/dashboard/ui/Toast";
import { setOrderStatus } from "@/lib/dashboard/actions/orders";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const DONE: Partial<Record<OrderStatus, Text>> = {
  TO_SEND: "dashboard.orders.useOrderStatus.orderAccepted",
  DONE: "dashboard.orders.useOrderStatus.orderCompleted",
  CANCELLED: "dashboard.orders.useOrderStatus.orderCancelled",
};

const CHANGED: Text = "dashboard.orders.useOrderStatus.orderUpdated";
const TROUBLE: Text = "dashboard.orders.useOrderStatus.couldnTChangeIt";

/** Moves an order along, and says so: the row alone only shows a new state. */
export function useOrderStatus(orderId: string) {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();

  const change = (status: OrderStatus) =>
    start(async () => {
      const result = await setOrderStatus(orderId, status).catch(() => ({ ok: false }));
      if (!result.ok) return notify(t(TROUBLE), "error");
      notify(t(DONE[status] ?? CHANGED));
    });

  return { pending, change };
}
