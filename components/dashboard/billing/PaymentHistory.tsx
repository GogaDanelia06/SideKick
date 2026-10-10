"use client";

import type { Payment } from "@prisma/client";
import { IconReceipt } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { fmtDate } from "@/lib/dashboard/time";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { STATUS } from "./billingConfig";

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  const { t } = useLanguage();

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-4 py-3 text-sm font-semibold">
        {t("dashboard.billing.view.paymentHistory")}
      </div>
      {payments.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted">{t("dashboard.billing.view.noPaymentsYet")}</div>
      ) : (
        payments.map((p) => {
          const s = STATUS[p.status];
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-border2 px-4 py-3 text-sm last:border-0"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-soft text-muted">
                <IconReceipt size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate">{p.description}</div>
                <div className="text-xs text-muted">
                  {fmtDate.format(new Date(p.date))}
                  {p.provider ? ` · ${p.provider}` : ""}
                </div>
              </div>
              <div className="font-mono">{p.amount}₾</div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.tone}`}>
                {t(s.label)}
              </span>
            </div>
          );
        })
      )}
    </Panel>
  );
}
