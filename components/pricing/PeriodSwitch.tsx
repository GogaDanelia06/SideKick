"use client";

import clsx from "clsx";
import { BILLING_PERIODS, type BillingPeriod } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function PeriodSwitch({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (p: BillingPeriod) => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t({ ka: "გამოწერის პერიოდი", en: "Billing period" })}
      className="inline-flex rounded-lg border border-border bg-card p-1"
    >
      {BILLING_PERIODS.map((p) => {
        const active = p.months === value.months;
        return (
          <button
            key={p.months}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p)}
            className={clsx(
              "rounded-sm px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-white" : "text-muted hover:text-ink",
            )}
          >
            {t(p.label)}
          </button>
        );
      })}
    </div>
  );
}
