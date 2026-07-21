import type { OrderStatus } from "@prisma/client";
import type { Bilingual } from "@/lib/content/types";
import type { Tone } from "./tone";

/** Status tabs for the orders screen. Counts come from the database. */
export type OrderTab = { key: OrderStatus; label: Bilingual; tone: Tone };

export const ORDER_TABS: OrderTab[] = [
  { key: "NEW", label: { ka: "ახალი", en: "New" }, tone: "green" },
  { key: "TO_SEND", label: { ka: "გასაგზავნი", en: "To ship" }, tone: "amber" },
  { key: "DONE", label: { ka: "დასრულებული", en: "Done" }, tone: "muted" },
  { key: "CANCELLED", label: { ka: "გაუქმებული", en: "Cancelled" }, tone: "red" },
  { key: "PROBLEM", label: { ka: "პრობლემური", en: "Issues" }, tone: "red" },
];
