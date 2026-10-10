"use client";

import { useState } from "react";
import type { PaymentProvider, Plan, Subscription } from "@prisma/client";
import { Panel } from "@/components/dashboard/ui/Panel";
import { planLabel } from "@/lib/content/packages";
import { fmtDate } from "@/lib/dashboard/time";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SUB_STATUS } from "./billingConfig";
import { PlanCheckout } from "./PlanCheckout";

export function PlanSummary({
  subscription,
  plans,
  providers,
  canManage,
}: {
  subscription: (Subscription & { plan: Plan }) | null;
  plans: Plan[];
  providers: PaymentProvider[];
  canManage: boolean;
}) {
  const { t } = useLanguage();
  const [picking, setPicking] = useState(false);
  const plan = subscription?.plan;
  const cancelled = subscription?.status === "CANCELLED";

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted">{t("dashboard.billing.view.currentPlan")}</div>
          <div className="mt-1 text-2xl font-semibold">{plan ? t(planLabel(plan)) : "—"}</div>
          {subscription ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{t(SUB_STATUS[subscription.status] ?? "dashboard.billing.view.text")}</span>
              {subscription.renewsAt ? (
                <>
                  <span>·</span>
                  <span>
                    {cancelled ? t("dashboard.billing.view.activeUntil") : t("dashboard.billing.view.renews")}{" "}
                    {fmtDate.format(new Date(subscription.renewsAt))}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold">{plan ? `${plan.price}₾` : "—"}</div>
          <div className="text-xs text-muted">/ {t("dashboard.billing.view.mo")}</div>
        </div>
      </div>

      <button
        type="button"
        disabled={!canManage}
        onClick={() => setPicking((v) => !v)}
        className="mt-4 h-10 w-full rounded-[8px] border border-border text-sm font-medium hover:border-blue disabled:opacity-50"
      >
        {picking
          ? t("dashboard.billing.view.close")
          : subscription
            ? t("dashboard.billing.view.changeOrRenewPlan")
            : t("dashboard.billing.view.chooseAPlan")}
      </button>

      {picking ? (
        <div className="mt-3">
          <PlanCheckout plans={plans} subscription={subscription} providers={providers} canManage={canManage} />
        </div>
      ) : null}
    </Panel>
  );
}
