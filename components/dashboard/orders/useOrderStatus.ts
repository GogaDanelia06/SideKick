"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { Bilingual } from "@/lib/content/types";
import { setOrderStatus } from "@/lib/dashboard/actions/orders";
import { useLanguage } from "@/lib/i18n/useLanguage";

const DONE: Partial<Record<OrderStatus, Bilingual>> = {
  TO_SEND: { ka: "შეკვეთა დადასტურდა", en: "Order accepted" },
  DONE: { ka: "შეკვეთა დასრულდა", en: "Order completed" },
  CANCELLED: { ka: "შეკვეთა გაუქმდა", en: "Order cancelled" },
};

const CHANGED: Bilingual = { ka: "შეკვეთა განახლდა", en: "Order updated" };
const TROUBLE: Bilingual = { ka: "ვერ შეიცვალა — სცადე ხელახლა", en: "Couldn't change it — try again" };

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
