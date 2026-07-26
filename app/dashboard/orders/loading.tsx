import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-5 overflow-hidden border-b border-border pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 shrink-0" />
        ))}
      </div>
      <Panel className="overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border2 px-4 py-3.5 last:border-0">
            <Skeleton className="h-3 w-20 shrink-0" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
