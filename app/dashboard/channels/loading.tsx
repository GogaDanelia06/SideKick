import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-3 w-2/3" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Panel key={i} className="flex flex-wrap items-center gap-4 p-4">
          <Skeleton className="size-11 shrink-0 rounded-[10px]" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-2.5 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-[8px]" />
          <Skeleton className="size-9 shrink-0 rounded-[8px]" />
        </Panel>
      ))}
    </div>
  );
}
