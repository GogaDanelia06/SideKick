"use client";

import { useState, useTransition } from "react";
import type { Plan, Subscription } from "@prisma/client";
import { switchPlanWithoutPayment } from "@/lib/dashboard/actions";
import { planLabel } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { CurrentPlanBadge, checkoutError } from "./checkoutParts";

/** Plan switching while no bank is configured; the server enforces the same rule. */
export function FreePlanSwitch({
  plans,
  subscription,
  canManage,
}: {
  plans: Plan[];
  subscription: (Subscription & { plan: Plan }) | null;
  canManage: boolean;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function choose(planKey: string) {
    setError(null);
    start(async () => {
      const res = await switchPlanWithoutPayment(planKey);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {plans.map((p) => {
          const current = subscription?.planId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending || !canManage || current}
              onClick={() => choose(p.key)}
              className={`flex items-center justify-between rounded-[8px] border px-3.5 py-3 text-left text-[13px] disabled:opacity-60 ${
                current ? "border-primary bg-green-surface" : "border-border hover:border-blue"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {t(planLabel(p))}
                {current ? <CurrentPlanBadge /> : null}
              </span>
              <span className="font-mono text-muted">
                {current ? null : t({ ka: "გადართვა", en: "Switch" })}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-[13px] text-red">{t(checkoutError(error))}</p> : null}
    </div>
  );
}
