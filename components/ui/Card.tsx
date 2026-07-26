import clsx from "clsx";
import type { ComponentProps } from "react";

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={clsx("rounded-md border border-border bg-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
