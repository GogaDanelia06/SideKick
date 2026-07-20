import clsx from "clsx";
import type { ReactNode } from "react";
import type { IconType } from "@/lib/content/types";

export function Badge({
  icon: Icon,
  children,
  className,
}: {
  icon?: IconType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-[7px] text-[13px] font-medium text-blue",
        className,
      )}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </span>
  );
}
