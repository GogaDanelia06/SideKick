"use client";

import { useState, useTransition } from "react";
import type { SubscriptionStatus } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { setBusinessPlan } from "@/lib/admin/actions/businesses";
import type { AdminBusiness, AdminPlan } from "@/lib/admin/businesses";
import { planLabel } from "@/lib/content/packages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const SELECT =
  "h-9 rounded-[7px] border border-input bg-canvas px-2.5 text-[13px] outline-none focus:border-blue";

const STATUSES: SubscriptionStatus[] = ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED"];

const STATUS_LABEL: Record<SubscriptionStatus, Text> = {
  TRIAL: "admin.businesses.businessRow.trial",
  ACTIVE: "admin.businesses.businessRow.active",
  PAST_DUE: "admin.businesses.businessRow.pastDue",
  CANCELLED: "admin.businesses.businessRow.cancelled",
};

const ERRORS: Record<string, Text> = {
  unknown_business: "admin.businesses.businessRow.businessNotFound",
  unknown_plan: "admin.businesses.businessRow.planNotFound",
};

export function BusinessRow({ business, plans }: { business: AdminBusiness; plans: AdminPlan[] }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const sub = business.subscription;

  const [planId, setPlanId] = useState(sub?.plan.id ?? plans[0]?.id ?? "");
  const [status, setStatus] = useState<SubscriptionStatus>(sub?.status ?? "TRIAL");
  const [resetUsage, setResetUsage] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = planId !== sub?.plan.id || status !== sub?.status;
  const limit = sub?.plan.msgLimit ?? 0;
  const used = sub?.msgUsed ?? 0;

  return (
    <div className="flex flex-col gap-3 border-b border-border2 p-4 last:border-b-0 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{business.name}</div>
        <div className="text-xs text-muted">
          {business._count.memberships} {t("admin.businesses.businessRow.members")} ·{" "}
          {business.channelsOn} {t("admin.businesses.businessRow.channels")} ·{" "}
          {business._count.products} {t("admin.businesses.businessRow.products")} ·{" "}
          {business._count.conversations} {t("admin.businesses.businessRow.chats")}
        </div>
      </div>

      <div className="w-[120px] shrink-0 text-xs">
        <div className="text-muted">{t("admin.businesses.businessRow.messages")}</div>
        <div className={`font-mono ${limit > 0 && used >= limit ? "text-red" : "text-ink"}`}>
          {used} / {limit || "—"}
        </div>
      </div>

      <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={SELECT} aria-label={t("admin.businesses.businessRow.plan")}>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {t(planLabel(p))} — {p.price}₾
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
        className={SELECT}
        aria-label={t("admin.businesses.businessRow.status")}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(STATUS_LABEL[s])}
          </option>
        ))}
      </select>

      <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted">
        <input type="checkbox" checked={resetUsage} onChange={(e) => setResetUsage(e.target.checked)} />
        {t("admin.businesses.businessRow.resetCounter")}
      </label>

      <button
        type="button"
        disabled={pending || (!changed && !resetUsage)}
        onClick={() =>
          start(async () => {
            setError(null);
            setSaved(false);
            const res = await setBusinessPlan(business.id, planId, status, resetUsage);
            if (res.ok) setSaved(true);
            else setError(res.error);
          })
        }
        className="h-9 shrink-0 rounded-[7px] bg-primary px-3.5 text-[13px] font-medium text-white disabled:opacity-50"
      >
        {pending ? t("admin.businesses.businessRow.saving") : t("admin.businesses.businessRow.save")}
      </button>

      {saved ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-green">
          <IconCheck size={14} /> {t("admin.businesses.businessRow.saved")}
        </span>
      ) : null}
      {error ? (
        <span className="shrink-0 text-[12px] text-red">
          {Object.hasOwn(ERRORS, error) ? t(ERRORS[error]) : error}
        </span>
      ) : null}
    </div>
  );
}
