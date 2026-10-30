"use client";

import type { Payment, PaymentProvider, Plan, Subscription } from "@prisma/client";
import { isActivated } from "@/lib/billing/activation";
import { ActivatePlan } from "@/components/dashboard/ActivatePlan";
import { CancelButton } from "./CancelButton";
import { PaymentHistory } from "./PaymentHistory";
import { PlanSummary } from "./PlanSummary";
import { SavedCard } from "./SavedCard";
import { UsagePanel } from "./UsagePanel";

export function BillingView({
  subscription,
  payments,
  cardName,
  plans,
  providers,
  canManage,
}: {
  subscription: (Subscription & { plan: Plan }) | null;
  payments: Payment[];
  cardName: string;
  plans: Plan[];
  providers: PaymentProvider[];
  canManage: boolean;
}) {
  const cancelled = subscription?.status === "CANCELLED";
  const activated = isActivated(subscription);
  const summary = <PlanSummary subscription={subscription} plans={plans} providers={providers} canManage={canManage} />;

  if (!activated) {
    return (
      <div className="grid max-w-[720px] gap-4">
        <ActivatePlan owner={canManage} />
        {summary}
        {payments.length > 0 ? <PaymentHistory payments={payments} /> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4">
        {summary}
        <UsagePanel subscription={subscription} />
        <PaymentHistory payments={payments} />
      </div>

      <div className="grid content-start gap-4">
        <SavedCard subscription={subscription} cardName={cardName} />
        <CancelButton disabled={!canManage || cancelled} cancelled={cancelled} />
      </div>
    </div>
  );
}
