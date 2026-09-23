import type { OrderStatus } from "@prisma/client";
import type { Tone } from "./tone";
import type { Text } from "@/lib/i18n/messages";

export type OrderTab = { key: OrderStatus; label: Text; tone: Tone };

export const ORDER_TABS: OrderTab[] = [
  { key: "NEW", label: "dashboard.orders.new", tone: "green" },
  { key: "TO_SEND", label: "dashboard.orders.toShip", tone: "amber" },
  { key: "DONE", label: "dashboard.orders.done", tone: "muted" },
  { key: "CANCELLED", label: "dashboard.orders.cancelled", tone: "red" },
  { key: "PROBLEM", label: "dashboard.orders.issues", tone: "red" },
];
