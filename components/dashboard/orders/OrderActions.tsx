"use client";

import type { OrderStatus } from "@prisma/client";
import { IconCircleCheck, IconPrinter, IconTruck, IconX } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

const BTN = "inline-flex h-9 items-center gap-1.5 rounded-[6px] px-4 text-[13px] font-medium disabled:opacity-60";

export function OrderActions({
  status,
  pending,
  onChange,
}: {
  status: OrderStatus;
  pending: boolean;
  onChange: (status: OrderStatus) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        disabled={pending || status === "TO_SEND"}
        onClick={() => onChange("TO_SEND")}
        className={`${BTN} bg-primary text-white`}
      >
        <IconTruck size={16} /> {t("dashboard.orders.row.accept")}
      </button>
      <button
        type="button"
        disabled={pending || status === "DONE"}
        onClick={() => onChange("DONE")}
        className={`${BTN} border border-border bg-surface text-green`}
      >
        <IconCircleCheck size={16} /> {t("dashboard.orders.row.complete")}
      </button>
      <button type="button" onClick={() => window.print()} className={`${BTN} border border-border bg-surface`}>
        <IconPrinter size={16} /> {t("dashboard.orders.row.print")}
      </button>
      <button
        type="button"
        disabled={pending || status === "CANCELLED"}
        onClick={() => onChange("CANCELLED")}
        className={`${BTN} border border-border bg-surface text-red`}
      >
        <IconX size={16} /> {t("dashboard.orders.row.cancel")}
      </button>
    </div>
  );
}
