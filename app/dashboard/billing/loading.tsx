import { Skeleton, SkeletonPanel } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-4">
        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="mt-2 h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="mt-4 h-10 w-full rounded-[8px]" />
        </Panel>
        <SkeletonPanel lines={2} />
        <Panel className="overflow-hidden p-5">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border2 py-3 last:border-0">
              <Skeleton className="size-8 shrink-0 rounded-[6px]" />
              <div className="flex-1"><Skeleton className="h-3 w-2/5" /></div>
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </Panel>
      </div>
      <div className="grid content-start gap-4">
        <Panel className="p-5">
          <Skeleton className="mb-3 h-3.5 w-28" />
          <Skeleton className="h-[112px] w-full rounded-[10px]" />
          <Skeleton className="mt-4 h-10 w-full rounded-[8px]" />
        </Panel>
        <Skeleton className="h-11 w-full rounded-[10px]" />
      </div>
    </div>
  );
}
