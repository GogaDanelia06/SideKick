import type { PlatformStats } from "@/lib/admin/analytics";
import { BiText } from "@/components/admin/ui/BiText";

export function PlanDistribution({ plans }: { plans: PlatformStats["plans"] }) {
  const total = plans.reduce((sum, x) => sum + x.subscribers, 0);

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-5">
      <BiText as="h2" className="mb-1 text-base font-semibold" value="admin.analytics.planDistribution" />
      <BiText
        as="p"
        className="mb-4 text-[12px] text-faint"
        value="admin.analytics.everySubscriptionTrialsIncluded"
      />
      <div className="flex flex-col gap-3">
        {plans.map((p) => {
          const pct = total > 0 ? Math.round((p.subscribers / total) * 100) : 0;
          return (
            <div key={p.key}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className="font-medium">
                  {p.name} <span className="text-faint">· {p.price}₾</span>
                </span>
                <span className="text-muted">
                  {p.subscribers} ({pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
