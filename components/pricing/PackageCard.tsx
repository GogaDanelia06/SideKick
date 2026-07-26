"use client";

import clsx from "clsx";
import { IconCheck, IconGift } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import {
  FREE_PERIOD,
  PACKAGE_META,
  periodPrice,
  type BillingPeriod,
  type Package,
} from "@/lib/content/packages";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function PackageCard({ pkg, period }: { pkg: Package; period: BillingPeriod }) {
  const { t } = useLanguage();

  const monthly = Number(pkg.price);
  const total = periodPrice(monthly, period);
  const perMonth = period.months > 1 ? Math.round(total / period.months) : null;

  return (
    <div
      className={clsx(
        "relative rounded-lg border bg-card p-7",
        pkg.featured ? "border-blue-ring" : "border-border",
      )}
    >
      {pkg.featured ? (
        <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {t(PACKAGE_META.popular)}
        </span>
      ) : null}

      <h3 className="text-xl font-semibold">{t(pkg.name)}</h3>

      <div className="mt-3.5 flex items-end gap-1">
        <span className="font-mono text-[38px] font-medium leading-none">{total}</span>
        <span className="text-[15px] text-muted">{t(period.unit)}</span>
      </div>

      {perMonth ? (
        <div className="mt-1 text-[13px] text-muted">
          ≈ {perMonth}₾ {t(FREE_PERIOD.monthlyEquivalent)}
        </div>
      ) : null}

      <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-green bg-green-surface px-3 py-1 text-xs font-semibold text-green">
        <IconGift size={13} />
        {t(FREE_PERIOD.badge)}
      </span>

      <Button
        href={ROUTES.register}
        variant={pkg.featured ? "primary" : "outline"}
        className="my-5 w-full"
      >
        {t(ACTIONS.getStarted)}
      </Button>

      <div className="flex flex-col gap-2.5">
        {pkg.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <IconCheck size={16} className="mt-0.5 shrink-0 text-green" />
            <span className="text-muted">{t(f)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
