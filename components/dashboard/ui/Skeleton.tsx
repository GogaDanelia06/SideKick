import clsx from "clsx";
import type { CSSProperties } from "react";
import { Panel } from "./Panel";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <span className={clsx("skeleton block", className)} style={style} aria-hidden="true" />;
}

export function SkeletonPanel({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <Panel className={clsx("p-5", className)}>
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 flex flex-col gap-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={clsx("h-3", i === lines - 1 ? "w-1/2" : "w-full")} />
        ))}
      </div>
    </Panel>
  );
}

export function SkeletonKpis({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Panel key={i} className="p-[18px]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-[34px] rounded-[9px]" />
          </div>
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </Panel>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex gap-4 border-b border-border px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border2 px-4 py-3.5 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={clsx("h-3", c === 0 ? "w-28 flex-none" : "flex-1")} />
          ))}
        </div>
      ))}
    </Panel>
  );
}

export function SkeletonPills({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-[8px]" />
      ))}
    </div>
  );
}

export function SkeletonCards({
  count = 3,
  height = "h-40",
}: {
  count?: number;
  height?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Panel key={i} className="p-5">
          <Skeleton className={clsx("w-full rounded-[10px]", height)} />
          <Skeleton className="mt-3 h-3.5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </Panel>
      ))}
    </div>
  );
}

export function SkeletonHeading() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-52" />
      </div>
      <Skeleton className="h-9 w-32 rounded-[8px]" />
    </div>
  );
}
