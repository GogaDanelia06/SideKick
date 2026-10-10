import type { PlatformStats } from "@/lib/admin/analytics";
import { BiText } from "@/components/admin/ui/BiText";

export function GrowthChart({ growth }: { growth: PlatformStats["growth"] }) {
  const max = Math.max(1, ...growth.map((g) => g.count));

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-5">
      <BiText as="h2" className="mb-4 text-base font-semibold" value="admin.analytics.newBusinesses6Months" />
      <div className="flex h-[140px] items-end gap-3">
        {growth.map((g) => (
          <div key={g.month} className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[12px] text-muted">{g.count}</span>
            <div
              className="w-full rounded-t-[4px] bg-primary"
              style={{ height: `${Math.max(4, (g.count / max) * 100)}%` }}
            />
            <span className="text-[11px] text-faint">{g.month.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
