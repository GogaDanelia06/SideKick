import clsx from "clsx";
import type { ReactNode } from "react";

/** Section eyebrow label with a decorative slash. */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-[7px] text-[13px] font-medium text-blue",
        className,
      )}
    >
      <span aria-hidden>/</span>
      {children}
    </span>
  );
}
