"use client";

import type { Plan, Subscription } from "@prisma/client";
import { IconCreditCardOff } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function SavedCard({
  subscription,
  cardName,
}: {
  subscription: (Subscription & { plan: Plan }) | null;
  cardName: string;
}) {
  const { t } = useLanguage();

  return (
    <Panel className="p-5">
      <div className="mb-3 text-sm font-semibold">{t("dashboard.billing.view.savedCard")}</div>
      <div className="rounded-[12px] bg-[#161b22] p-5 text-white">
        <div className="mb-8 font-mono tracking-[0.25em]">
          •••• •••• •••• {subscription?.cardRef ? subscription.cardRef.slice(-4) : "————"}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase">{cardName || "—"}</span>
          <span className="font-mono">{subscription?.cardRef ? "••/••" : "—"}</span>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-border2 bg-soft px-3 py-2.5 text-xs text-muted">
        <IconCreditCardOff size={15} className="mt-px shrink-0" />
        {subscription?.cardRef
          ? t("dashboard.billing.view.theCardIsStored")
          : t("dashboard.billing.view.aCardIsSaved")}
      </div>
    </Panel>
  );
}
