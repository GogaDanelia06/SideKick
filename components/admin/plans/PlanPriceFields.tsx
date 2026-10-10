"use client";

import type { Plan } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PlanNumberField } from "./PlanNumberField";
import { INPUT, LABEL } from "./planForm";

export function PlanPriceFields({ plan }: { plan: Plan }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>{t("admin.plans.editor.nameKa")}</span>
          <input name="name" required defaultValue={plan.name} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.plans.editor.nameEn")}</span>
          <input name="nameEn" defaultValue={plan.nameEn} className={INPUT} />
        </label>
        <PlanNumberField name="price" label="admin.plans.editor.priceMo" value={plan.price} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.plans.editor.price3Months")}</span>
          <input
            name="price3m"
            type="number"
            defaultValue={plan.price3m ?? ""}
            placeholder={String(plan.price * 3)}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.plans.editor.price12Months")}</span>
          <input
            name="price12m"
            type="number"
            defaultValue={plan.price12m ?? ""}
            placeholder={String(plan.price * 12)}
            className={INPUT}
          />
        </label>
      </div>
      <p className="mt-1.5 text-[12px] text-faint">{t("admin.plans.editor.emptyNoDiscountMonthly")}</p>
    </>
  );
}
