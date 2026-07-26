import { SkeletonKpis, SkeletonPanel } from "@/components/dashboard/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonKpis />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SkeletonPanel lines={3} />
        <SkeletonPanel lines={3} />
      </div>
      <SkeletonPanel lines={3} />
    </div>
  );
}
