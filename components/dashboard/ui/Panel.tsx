import clsx from "clsx";
import type { ReactNode } from "react";

/** Standard dashboard surface card: elevated surface, hairline border, 14px radius. */
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={clsx("rounded-[14px] border border-border bg-surface", className)}>
      {children}
    </div>
  );
}
