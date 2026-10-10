"use client";

import type { Plan } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, LABEL } from "./planForm";

const SLOTS = [0, 1, 2, 3, 4];

export function PlanExtras({ plan }: { plan: Plan }) {
  const { t } = useLanguage();

  return (
    <div className="mt-4">
      <span className={LABEL}>{t("admin.plans.editor.extraFeatures5Slots")}</span>
      <div className="flex flex-col gap-2">
        {SLOTS.map((i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <input
              name={`extraKa${i}`}
              defaultValue={plan.extrasKa[i] ?? ""}
              placeholder={t("admin.plans.editor.extraGeorgian", { n: i + 1 })}
              className={INPUT}
            />
            <input
              name={`extraEn${i}`}
              defaultValue={plan.extrasEn[i] ?? ""}
              placeholder={t("admin.plans.editor.extraEnglish", { n: i + 1 })}
              className={INPUT}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
