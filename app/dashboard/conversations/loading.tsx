import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px] lg:grid-cols-[340px_1fr]">
      <Panel className="flex min-h-0 flex-col overflow-hidden lg:h-full">
        <div className="flex flex-wrap gap-1.5 border-b border-border2 p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 border-b border-border2 px-3.5 py-3">
              <Skeleton className="size-[38px] shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="hidden min-h-0 flex-col overflow-hidden lg:flex lg:h-full">
        <div className="flex items-center gap-2.5 border-b border-border2 p-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-1.5 h-2.5 w-20" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 bg-soft p-4">
          <Skeleton className="h-12 w-3/5 rounded-[13px]" />
          <Skeleton className="ml-auto h-14 w-2/3 rounded-[13px]" />
          <Skeleton className="h-10 w-2/5 rounded-[13px]" />
        </div>
      </Panel>
    </div>
  );
}
