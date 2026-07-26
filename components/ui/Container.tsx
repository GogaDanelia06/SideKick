import clsx from "clsx";
import type { ReactNode } from "react";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-[1140px] px-6", className)}>
      {children}
    </div>
  );
}
