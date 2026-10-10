import type { PlatformStats } from "@/lib/admin/analytics";
import { BiText } from "@/components/admin/ui/BiText";
import { phrase } from "@/lib/i18n/messages";
import { fmt } from "./format";
import { Figure, SubCount } from "./IncomeFigures";

export function IncomePanel({ stats }: { stats: PlatformStats }) {
  const { income, subscriptions } = stats;

  return (
    <div className="mb-6 rounded-lg border border-green bg-green-surface/30 p-5">
      <BiText as="h2" className="mb-4 text-base font-semibold" value="admin.analytics.ourIncome" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Figure
          label="admin.analytics.monthlyRecurringMrr"
          value={`${fmt(income.mrr)}₾`}
          sub={phrase("admin.analytics.subscriptionsActive", { count: fmt(subscriptions.active) })}
          strong
        />
        <Figure label="admin.analytics.collectedThisMonth" value={`${fmt(income.collectedThisMonth)}₾`} />
        <Figure label="admin.analytics.collectedInTotal" value={`${fmt(income.collectedTotal)}₾`} />
        <Figure
          label="admin.analytics.paymentProblems"
          value={fmt(income.failedThisMonth + income.pending)}
          sub={phrase("admin.analytics.paymentsFailedPending", {
            failed: income.failedThisMonth,
            pending: income.pending,
          })}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border2 pt-4 text-[12px] text-muted">
        <SubCount label="admin.analytics.trial" count={subscriptions.trial} tone="text-ink" />
        <SubCount label="admin.analytics.active" count={subscriptions.active} tone="text-green" />
        <SubCount label="admin.analytics.pastDue" count={subscriptions.pastDue} tone="text-amber" />
        <SubCount label="admin.analytics.cancelled" count={subscriptions.cancelled} tone="text-faint" />
      </div>
    </div>
  );
}
