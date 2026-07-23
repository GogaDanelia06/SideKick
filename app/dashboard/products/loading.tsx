import { SkeletonPills, SkeletonTable } from "@/components/dashboard/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonPills count={3} />
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}
