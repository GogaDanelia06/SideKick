import { Skeleton, SkeletonTable } from "@/components/dashboard/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-36 rounded-[8px]" />
      </div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}
