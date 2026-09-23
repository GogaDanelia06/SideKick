"use client";

import { useState, useTransition } from "react";
import type { Payment, PaymentProvider, PaymentStatus, Plan, Subscription } from "@prisma/client";
import { IconCreditCardOff, IconReceipt } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { cancelSubscription } from "@/lib/dashboard/actions";
import { fmtDate } from "@/lib/dashboard/time";
import { planLabel } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PlanCheckout } from "./PlanCheckout";
import type { Text } from "@/lib/i18n/messages";

type Props = {
  subscription: (Subscription & { plan: Plan }) | null;
  payments: Payment[];
  cardName: string;
  plans: Plan[];
  providers: PaymentProvider[];
  canManage: boolean;
};

const STATUS: Record<PaymentStatus, { label: Text; tone: string }> = {
  PAID: { label: "dashboard.billing.view.paid", tone: "bg-green-surface text-green" },
  PENDING: { label: "dashboard.billing.view.pending", tone: "bg-soft text-muted" },
  FAILED: { label: "dashboard.billing.view.failed", tone: "bg-red-surface text-red" },
  EXPIRED: { label: "dashboard.billing.view.expired", tone: "bg-soft text-muted" },
};

const SUB_STATUS: Record<string, Text> = {
  TRIAL: "dashboard.billing.view.trial",
  ACTIVE: "dashboard.billing.view.active",
  PAST_DUE: "dashboard.billing.view.pastDue",
  CANCELLED: "dashboard.billing.view.cancelled",
};

export function BillingView({
  subscription,
  payments,
  cardName,
  plans,
  providers,
  canManage,
}: Props) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [picking, setPicking] = useState(false);
  const plan = subscription?.plan;
  const used = subscription?.msgUsed ?? 0;
  const limit = plan?.msgLimit ?? 0;
  const unlimited = limit < 0;
  const remaining = unlimited ? 0 : Math.max(0, limit - used);
  const pct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const cancelled = subscription?.status === "CANCELLED";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4">
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
                        {cancelled
                          ? t("dashboard.billing.view.activeUntil")
                          : t("dashboard.billing.view.renews")}{" "}
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
              <PlanCheckout
                plans={plans}
                subscription={subscription}
                providers={providers}
                canManage={canManage}
              />
            </div>
          ) : null}
        </Panel>

        <Panel className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{t("dashboard.billing.view.messageLimit")}</span>
            <span className="font-mono text-sm">{unlimited ? "∞" : `${remaining.toLocaleString()} / ${limit.toLocaleString()}`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${unlimited ? 15 : pct}%` }} /></div>
          <div className="mt-2 text-xs text-muted">
            {t("dashboard.billing.view.remaining")} {unlimited ? "∞" : remaining.toLocaleString()}
            {subscription?.renewsAt ? ` · ${t("dashboard.billing.view.resets")} ${fmtDate.format(new Date(subscription.renewsAt))}` : ""}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">{t("dashboard.billing.view.paymentHistory")}</div>
          {payments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">{t("dashboard.billing.view.noPaymentsYet")}</div>
          ) : (
            payments.map((p) => {
              const s = STATUS[p.status];
              return (
                <div key={p.id} className="flex items-center gap-3 border-b border-border2 px-4 py-3 text-sm last:border-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-soft text-muted"><IconReceipt size={16} /></span>
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
      </div>

      <div className="grid content-start gap-4">
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

        <button
          type="button"
          disabled={pending || !canManage || !subscription || cancelled}
          onClick={() => start(async () => { await cancelSubscription(); })}
          className="h-11 rounded-[10px] border border-red text-sm font-medium text-red hover:bg-red-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelled
            ? t("dashboard.billing.view.subscriptionCancelled")
            : t("dashboard.billing.view.cancelSubscription")}
        </button>
      </div>
    </div>
  );
}
