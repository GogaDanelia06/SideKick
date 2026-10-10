"use client";

import type { Plan, Subscription } from "@prisma/client";
import { Panel } from "@/components/dashboard/ui/Panel";
import { fmtDate } from "@/lib/dashboard/time";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function UsagePanel({ subscription }: { subscription: (Subscription & { plan: Plan }) | null }) {
  const { t } = useLanguage();
  const used = subscription?.msgUsed ?? 0;
  const limit = subscription?.plan.msgLimit ?? 0;
  const unlimited = limit < 0;
  const remaining = unlimited ? 0 : Math.max(0, limit - used);
  const pct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <Panel className="p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{t("dashboard.billing.view.messageLimit")}</span>
        <span className="font-mono text-sm">
          {unlimited ? "∞" : `${remaining.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${unlimited ? 15 : pct}%` }} />
      </div>
      <div className="mt-2 text-xs text-muted">
        {t("dashboard.billing.view.remaining")} {unlimited ? "∞" : remaining.toLocaleString()}
        {subscription?.renewsAt
          ? ` · ${t("dashboard.billing.view.resets")} ${fmtDate.format(new Date(subscription.renewsAt))}`
          : ""}
      </div>
    </Panel>
  );
}
