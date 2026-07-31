"use client";

import { useState, useTransition } from "react";
import type { Payment, PaymentProvider, PaymentStatus, Plan, Subscription } from "@prisma/client";
import { IconCreditCardOff, IconReceipt } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { cancelSubscription } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";
import { PlanCheckout } from "./PlanCheckout";

type Props = {
  subscription: (Subscription & { plan: Plan }) | null;
  payments: Payment[];
  cardName: string;
  plans: Plan[];
  providers: PaymentProvider[];
  canManage: boolean;
};

const STATUS: Record<PaymentStatus, { label: Bilingual; tone: string }> = {
  PAID: { label: { ka: "გადახდილი", en: "Paid" }, tone: "bg-green-surface text-green" },
  PENDING: { label: { ka: "მიმდინარე", en: "Pending" }, tone: "bg-soft text-muted" },
  FAILED: { label: { ka: "ვერ შესრულდა", en: "Failed" }, tone: "bg-red-surface text-red" },
  EXPIRED: { label: { ka: "ვადაგასული", en: "Expired" }, tone: "bg-soft text-muted" },
};

const SUB_STATUS: Record<string, Bilingual> = {
  TRIAL: { ka: "საცდელი პერიოდი", en: "Trial" },
  ACTIVE: { ka: "აქტიური", en: "Active" },
  PAST_DUE: { ka: "გადახდის ვადა გავიდა", en: "Past due" },
  CANCELLED: { ka: "გაუქმებული", en: "Cancelled" },
};

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

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
              <div className="text-xs text-muted">{t({ ka: "მიმდინარე პაკეტი", en: "Current plan" })}</div>
              <div className="mt-1 text-2xl font-semibold">{plan?.name ?? "—"}</div>
              {subscription ? (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{t(SUB_STATUS[subscription.status] ?? { ka: "—", en: "—" })}</span>
                  {subscription.renewsAt ? (
                    <>
                      <span>·</span>
                      <span>
                        {cancelled
                          ? t({ ka: "მოქმედებს", en: "Active until" })
                          : t({ ka: "განახლდება", en: "Renews" })}{" "}
                        {fmtDate(new Date(subscription.renewsAt))}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-semibold">{plan ? `${plan.price}₾` : "—"}</div>
              <div className="text-xs text-muted">/ {t({ ka: "თვე", en: "mo" })}</div>
            </div>
          </div>

          <button
            type="button"
            disabled={!canManage}
            onClick={() => setPicking((v) => !v)}
            className="mt-4 h-10 w-full rounded-[8px] border border-border text-sm font-medium hover:border-blue disabled:opacity-50"
          >
            {picking
              ? t({ ka: "დახურვა", en: "Close" })
              : subscription
                ? t({ ka: "პაკეტის შეცვლა ან გაგრძელება", en: "Change or renew plan" })
                : t({ ka: "პაკეტის არჩევა", en: "Choose a plan" })}
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
            <span className="text-sm font-medium">{t({ ka: "შეტყობინებების ლიმიტი", en: "Message limit" })}</span>
            <span className="font-mono text-sm">{unlimited ? "∞" : `${remaining.toLocaleString()} / ${limit.toLocaleString()}`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${unlimited ? 15 : pct}%` }} /></div>
          <div className="mt-2 text-xs text-muted">
            {t({ ka: "დარჩენილი", en: "Remaining" })} {unlimited ? "∞" : remaining.toLocaleString()}
            {subscription?.renewsAt ? ` · ${t({ ka: "განულდება", en: "Resets" })} ${fmtDate(new Date(subscription.renewsAt))}` : ""}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">{t({ ka: "გადახდის ისტორია", en: "Payment history" })}</div>
          {payments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">{t({ ka: "გადახდები ჯერ არ არის", en: "No payments yet" })}</div>
          ) : (
            payments.map((p) => {
              const s = STATUS[p.status];
              return (
                <div key={p.id} className="flex items-center gap-3 border-b border-border2 px-4 py-3 text-sm last:border-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-soft text-muted"><IconReceipt size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{p.description}</div>
                    <div className="text-xs text-muted">
                      {fmtDate(new Date(p.date))}
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
          <div className="mb-3 text-sm font-semibold">{t({ ka: "შენახული ბარათი", en: "Saved card" })}</div>
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
              ? t({
                  ka: "ბარათი ბანკის მხარეს ინახება. ჩვენ მხოლოდ მიბმის კოდი გვაქვს.",
                  en: "The card is stored by the bank. We only hold a reference to it.",
                })
              : t({
                  ka: "ბარათი შეინახება პირველი გადახდისას, რომ გამოწერა ავტომატურად განახლდეს.",
                  en: "A card is saved on your first payment so the plan can renew automatically.",
                })}
          </div>
        </Panel>

        <button
          type="button"
          disabled={pending || !canManage || !subscription || cancelled}
          onClick={() => start(async () => { await cancelSubscription(); })}
          className="h-11 rounded-[10px] border border-red text-sm font-medium text-red hover:bg-red-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelled
            ? t({ ka: "გამოწერა გაუქმებულია", en: "Subscription cancelled" })
            : t({ ka: "გააუქმე გამოწერა", en: "Cancel subscription" })}
        </button>
      </div>
    </div>
  );
}
