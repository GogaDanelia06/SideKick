"use client";

import { useState, useTransition } from "react";
import type { Payment, Plan, Subscription } from "@prisma/client";
import { IconCheck, IconCreditCardOff, IconReceipt } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { changePlan } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = {
  subscription: (Subscription & { plan: Plan }) | null;
  payments: Payment[];
  cardName: string;
  plans: Plan[];
};

export function BillingView({ subscription, payments, cardName, plans }: Props) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = subscription?.plan;
  const used = subscription?.msgUsed ?? 0;
  const limit = plan?.msgLimit ?? 0;
  const unlimited = limit < 0;
  const remaining = unlimited ? 0 : Math.max(0, limit - used);
  const pct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4">
        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-muted">{t({ ka: "მიმდინარე პაკეტი", en: "Current plan" })}</div>
              <div className="mt-1 text-2xl font-semibold">{plan?.name ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-semibold">{plan ? `${plan.price}₾` : "—"}</div>
              <div className="text-xs text-muted">/ {t({ ka: "თვე", en: "mo" })}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setPicking((v) => !v); setError(null); }}
            className="mt-4 h-10 w-full rounded-[8px] border border-border text-sm font-medium hover:border-blue"
          >
            {picking ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "პაკეტის შეცვლა", en: "Change plan" })}
          </button>

          {picking ? (
            <div className="mt-3 grid gap-2">
              {plans.map((p) => {
                const current = subscription?.planId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={pending || current}
                    onClick={() =>
                      start(async () => {
                        const res = await changePlan(p.key);
                        if (!res.ok) setError(res.error);
                        else setPicking(false);
                      })
                    }
                    className={`flex items-center justify-between rounded-[8px] border px-3.5 py-2.5 text-left text-[13px] disabled:opacity-60 ${current ? "border-primary bg-green-surface text-green" : "border-border hover:border-blue"}`}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="flex items-center gap-2 font-mono">
                      {p.price}₾
                      {current ? <IconCheck size={15} /> : null}
                    </span>
                  </button>
                );
              })}
              {error ? (
                <p className="text-xs text-red">
                  {error === "forbidden"
                    ? t({ ka: "მხოლოდ მფლობელს შეუძლია პაკეტის შეცვლა", en: "Only the owner can change the plan" })
                    : t({ ka: "ვერ შეიცვალა", en: "Could not change plan" })}
                </p>
              ) : null}
              <p className="text-xs text-muted">
                {t({
                  ka: "პაკეტი იცვლება მაშინვე. გადახდის აღება დაემატება საგადახდო მოდულთან ერთად.",
                  en: "The plan changes immediately. Taking payment arrives with the payments module.",
                })}
              </p>
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
            {t({ ka: "დარჩენილი", en: "Remaining" })} {unlimited ? "∞" : remaining.toLocaleString()} · {t({ ka: "განახლდება 1 აგვისტოს", en: "Resets Aug 1" })}
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">{t({ ka: "გადახდის ისტორია", en: "Payment history" })}</div>
          {payments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">{t({ ka: "გადახდები ჯერ არ არის", en: "No payments yet" })}</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-border2 px-4 py-3 text-sm last:border-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-soft text-muted"><IconReceipt size={16} /></span>
                <div className="min-w-0 flex-1"><div className="truncate">{p.description}</div><div className="text-xs text-muted">{new Date(p.date).toISOString().slice(0, 10)}</div></div>
                <div className="font-mono">{p.amount}₾</div>
                <span className="rounded-full bg-green-surface px-2.5 py-1 text-[11px] font-semibold text-green">{t({ ka: "გადახდილი", en: "Paid" })}</span>
              </div>
            ))
          )}
        </Panel>
      </div>
      <div className="grid content-start gap-4">
        <Panel className="p-5">
          <div className="mb-3 text-sm font-semibold">{t({ ka: "ბარათის მიბმა", en: "Payment card" })}</div>
          <div className="rounded-[12px] bg-[#161b22] p-5 text-white">
            <div className="mb-8 font-mono tracking-[0.25em]">•••• •••• •••• {subscription?.cardRef ?? "————"}</div>
            <div className="flex items-center justify-between text-xs"><span className="uppercase">{cardName || "—"}</span><span className="font-mono">08/28</span></div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-border2 bg-soft px-3 py-2.5 text-xs text-muted">
            <IconCreditCardOff size={15} className="mt-px shrink-0" />
            {t({
              ka: "ბარათის მართვა დაემატება საგადახდო მოდულთან ერთად (BOG / TBC).",
              en: "Card management arrives with the payments module (BOG / TBC).",
            })}
          </div>
        </Panel>
        <button
          type="button"
          disabled
          title={t({ ka: "საჭიროებს საგადახდო მოდულს", en: "Requires the payments module" })}
          className="h-11 cursor-not-allowed rounded-[10px] border border-red text-sm font-medium text-red opacity-50"
        >
          {t({ ka: "გააუქმე გამოწერა", en: "Cancel subscription" })}
        </button>
      </div>
    </div>
  );
}
