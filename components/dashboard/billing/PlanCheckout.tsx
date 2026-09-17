"use client";

import { useState, useTransition } from "react";
import type { PaymentProvider, Plan, Subscription } from "@prisma/client";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { startPlanCheckout } from "@/lib/dashboard/actions";
import { BILLING_PERIODS, periodPrice, periodSavingPct, planLabel } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { track } from "@/lib/analytics/track";
import { BankChoice, CurrentPlanBadge, checkoutError } from "./checkoutParts";
import { FreePlanSwitch } from "./FreePlanSwitch";

type Props = {
  plans: Plan[];
  subscription: (Subscription & { plan: Plan }) | null;
  providers: PaymentProvider[];
  canManage: boolean;
};

/** Plan, period and bank selection; the server recomputes the price. */
export function PlanCheckout({ plans, subscription, providers, canManage }: Props) {
  const { t, locale } = useLanguage();
  const [pending, start] = useTransition();
  const [months, setMonths] = useState(1);
  const [planKey, setPlanKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = plans.find((p) => p.key === planKey) ?? null;

  function pay(provider: PaymentProvider) {
    if (!selected) return;
    setError(null);
    start(async () => {
      const res = await startPlanCheckout(selected.key, months, provider, locale);
      if (!res.ok) setError(res.error);
      else window.location.href = res.redirectUrl;
    });
  }

  if (providers.length === 0) {
    return <FreePlanSwitch plans={plans} subscription={subscription} canManage={canManage} />;
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-1.5">
        {BILLING_PERIODS.map((p) => (
          <button
            key={p.months}
            type="button"
            onClick={() => setMonths(p.months)}
            className={`h-9 flex-1 rounded-[8px] border text-[13px] font-medium transition-colors ${
              months === p.months ? "border-primary bg-green-surface text-green" : "border-border text-muted hover:text-ink"
            }`}
          >
            {t(p.label)}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {plans.map((p) => {
          const saving = periodSavingPct(p, months);
          const chosen = planKey === p.key;
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending || !canManage}
              onClick={() => {
                setPlanKey(p.key);
                setError(null);
                track("pricing_plan_selected", { plan: p.key });
              }}
              className={`flex items-center justify-between rounded-[8px] border px-3.5 py-3 text-left text-[13px] disabled:opacity-60 ${
                chosen ? "border-primary bg-green-surface" : "border-border hover:border-blue"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {t(planLabel(p))}
                {subscription?.planId === p.id ? <CurrentPlanBadge /> : null}
              </span>
              <span className="flex items-center gap-2">
                {saving > 0 ? (
                  <span className="rounded-full bg-green-surface px-2 py-0.5 text-[11px] font-semibold text-green">
                    −{saving}%
                  </span>
                ) : null}
                <span className="font-mono font-semibold">{periodPrice(p, months)}₾</span>
                {chosen ? <IconCheck size={15} className="text-green" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? <BankChoice providers={providers} pending={pending} onPay={pay} /> : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(checkoutError(error))}
        </div>
      ) : null}
    </div>
  );
}
