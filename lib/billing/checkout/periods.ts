import type { Plan } from "@prisma/client";
import { periodPrice } from "@/lib/content/packages";

export const ALLOWED_MONTHS = [1, 3, 12] as const;
export type Months = (typeof ALLOWED_MONTHS)[number];

export function isAllowedMonths(value: number): value is Months {
  return (ALLOWED_MONTHS as readonly number[]).includes(value);
}

export function amountFor(plan: Plan, months: Months): number {
  return periodPrice(plan, months);
}
