import { Skeleton, SkeletonTable } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-[8px]" />
      </div>
      <SkeletonTable rows={4} cols={4} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Panel key={i} className="p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-2.5 w-full" />
            <Skeleton className="mt-1.5 h-2.5 w-3/4" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
