"use client";

import type { Plan } from "@prisma/client";
import { IconCheck, IconStarFilled } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PlanExtras } from "./PlanExtras";
import { PlanLimitFields } from "./PlanLimitFields";
import { PlanPriceFields } from "./PlanPriceFields";

export function PlanCard({
  plan,
  saved,
  pending,
  onSave,
}: {
  plan: Plan;
  saved: boolean;
  pending: boolean;
  onSave: (fd: FormData) => void;
}) {
  const { t } = useLanguage();

  return (
    <form action={onSave} className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full border border-border bg-soft px-2.5 py-0.5 font-mono text-[12px] text-muted">
          {plan.key}
        </span>
        {plan.featured ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green">
            <IconStarFilled size={12} /> {t("admin.plans.editor.featured")}
          </span>
        ) : null}
      </div>

      <PlanPriceFields plan={plan} />
      <PlanLimitFields plan={plan} />
      <PlanExtras plan={plan} />

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" name="featured" defaultChecked={plan.featured} className="accent-[var(--primary)]" />
          {t("admin.plans.editor.featuredPlan")}
        </label>
        <div className="flex items-center gap-3">
          {saved ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-green">
              <IconCheck size={15} /> {t("admin.plans.editor.saved")}
            </span>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
          >
            {pending ? "…" : t("admin.plans.editor.save")}
          </button>
        </div>
      </div>
    </form>
  );
}
