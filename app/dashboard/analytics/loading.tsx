import { Skeleton, SkeletonKpis, SkeletonPanel } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-[6px]" />
          ))}
        </div>
        <Skeleton className="h-10 w-40 rounded-[8px]" />
      </div>
      <SkeletonKpis />
      <Panel className="p-5">
        <Skeleton className="h-4 w-28" />
        <div className="mt-5 flex h-40 items-end gap-2">
          {[45, 70, 55, 85, 60, 95, 75, 100].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-[4px]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonPanel lines={4} />
        <SkeletonPanel lines={4} />
        <SkeletonPanel lines={4} />
      </div>
      <SkeletonPanel lines={5} />
    </div>
  );
}
