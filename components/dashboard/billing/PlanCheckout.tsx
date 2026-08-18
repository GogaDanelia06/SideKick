"use client";

import { useState, useTransition } from "react";
import type { PaymentProvider, Plan, Subscription } from "@prisma/client";
import { IconAlertTriangle, IconCheck, IconExternalLink } from "@tabler/icons-react";
import { startPlanCheckout, switchPlanWithoutPayment } from "@/lib/dashboard/actions";
import { BILLING_PERIODS, periodPrice, periodSavingPct } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";
import { track } from "@/lib/analytics/track";

const BANKS: Record<PaymentProvider, string> = {
  BOG: "საქართველოს ბანკი",
  TBC: "TBC ბანკი",
};

const ERRORS: Record<string, Bilingual> = {
  forbidden: { ka: "მხოლოდ მფლობელს შეუძლია პაკეტის შეცვლა", en: "Only the owner can change the plan" },
  bad_period: { ka: "აირჩიეთ პერიოდი", en: "Pick a period" },
  unknown_provider: { ka: "აირჩიეთ ბანკი", en: "Pick a bank" },
  provider_unavailable: {
    ka: "ეს ბანკი ჯერ არ არის ჩართული",
    en: "That bank is not enabled yet",
  },
  checkout_failed: {
    ka: "ბანკთან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა ან აირჩიეთ სხვა ბანკი.",
    en: "Could not reach the bank. Try again or pick the other one.",
  },
};

/**
 * Plan, period, bank — then off to the bank's own page.
 *
 * Nothing here decides what is charged: the server recomputes the price from
 * the plan row, so the figures shown are for the customer's benefit only.
 */
export function PlanCheckout({
  plans,
  subscription,
  providers,
  canManage,
}: {
  plans: Plan[];
  subscription: (Subscription & { plan: Plan }) | null;
  providers: PaymentProvider[];
  canManage: boolean;
}) {
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

  /**
   * With no bank configured, the plans are still switchable — just free.
   *
   * The dead warning that stood here was accurate and unhelpful: it left no way
   * to try a tier, so the three prices on the pricing page could not be
   * exercised at all. The switch disappears by itself the moment BOG or TBC
   * credentials exist, because that is the same condition the real checkout
   * waits on — and the server refuses it independently, so this is a screen the
   * guard happens to agree with rather than the guard itself.
   */
  if (providers.length === 0) {
    return (
      <div className="grid gap-3">
        <div className="flex items-start gap-2 rounded-[8px] border border-amber bg-soft px-3.5 py-2.5 text-[13px] text-muted">
          <IconAlertTriangle size={16} className="mt-px shrink-0 text-amber" />
          {t({
            ka: "გადახდა ჯერ არ არის ჩართული. გეგმა დროებით უფასოდ იცვლება — ბანკის დაკავშირების შემდეგ გადახდა დაგჭირდება.",
            en: "Payments are not enabled yet. Plans switch for free in the meantime — once a bank is connected, payment will be required.",
          })}
        </div>

        <div className="grid gap-2">
          {plans.map((p) => {
            const current = subscription?.planId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={pending || !canManage || current}
                onClick={() => {
                  setError(null);
                  start(async () => {
                    const res = await switchPlanWithoutPayment(p.key);
                    if (!res.ok) setError(res.error);
                  });
                }}
                className={`flex items-center justify-between rounded-[8px] border px-3.5 py-3 text-left text-[13px] disabled:opacity-60 ${
                  current ? "border-primary bg-green-surface" : "border-border hover:border-blue"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  {p.name}
                  {current ? (
                    <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
                      {t({ ka: "მიმდინარე", en: "Current" })}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-muted">
                  {current ? null : t({ ka: "გადართვა", en: "Switch" })}
                </span>
              </button>
            );
          })}
        </div>

        {error ? <p className="text-[13px] text-red">{error}</p> : null}
      </div>
    );
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
          const current = subscription?.planId === p.id;
          const total = periodPrice(p, months);
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
                {p.name}
                {current ? (
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
                    {t({ ka: "მიმდინარე", en: "Current" })}
                  </span>
                ) : null}
              </span>
              <span className="flex items-center gap-2">
                {saving > 0 ? (
                  <span className="rounded-full bg-green-surface px-2 py-0.5 text-[11px] font-semibold text-green">
                    −{saving}%
                  </span>
                ) : null}
                <span className="font-mono font-semibold">{total}₾</span>
                {chosen ? <IconCheck size={15} className="text-green" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="grid gap-2 rounded-[8px] border border-border bg-soft p-3">
          <div className="text-[12px] text-muted">
            {t({ ka: "გადახდა ბანკის გვერდზე:", en: "Pay on the bank's page:" })}
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map((bank) => (
              <button
                key={bank}
                type="button"
                disabled={pending}
                onClick={() => pay(bank)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
              >
                {pending ? "…" : <IconExternalLink size={15} />}
                {BANKS[bank]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-faint">
            {t({
              ka: "ბარათის მონაცემები ბანკის გვერდზე შეიყვანება — ჩვენთან არ ინახება.",
              en: "Card details are entered on the bank's page — we never store them.",
            })}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}
    </div>
  );
}
