"use client";

import type { AdminBusiness, AdminPlan } from "@/lib/admin/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { BusinessRow } from "./BusinessRow";

export function BusinessPlans({
  businesses,
  plans,
}: {
  businesses: AdminBusiness[];
  plans: AdminPlan[];
}) {
  const { t } = useLanguage();

  if (plans.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted">
        {t({
          ka: "გეგმები ჯერ არ არის შექმნილი. დაამატე ფასების გვერდის რედაქტორში.",
          en: "No plans exist yet. Add them in the pricing page editor.",
        })}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{t({ ka: "ბიზნესები", en: "Businesses" })}</h3>
        <span className="text-xs text-muted">
          {businesses.length} {t({ ka: "სულ", en: "total" })}
        </span>
      </div>

      {businesses.map((b) => (
        <BusinessRow key={b.id} business={b} plans={plans} />
      ))}

      {businesses.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          {t({ ka: "ბიზნესები არ არის", en: "No businesses" })}
        </p>
      ) : null}
    </div>
  );
}
