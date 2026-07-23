import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
      <Panel className="flex flex-col p-3 lg:h-[calc(100vh-7rem)] lg:min-h-[520px]">
        <Skeleton className="mx-2 mb-3 h-2.5 w-24" />
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-[8px]" />
          ))}
        </div>
        <div className="mt-auto border-t border-border2 pt-3">
          <Skeleton className="h-10 w-full rounded-[8px]" />
        </div>
      </Panel>
      <Panel className="p-5">
        <Skeleton className="h-4 w-44" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="mt-2 h-10 w-full rounded-[8px]" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-24 w-full rounded-[8px]" />
      </Panel>
    </div>
  );
}
