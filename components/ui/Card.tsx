import clsx from "clsx";
import type { ComponentProps } from "react";

/** Bordered surface on the `--card` token. Radius defaults to 8px. */
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
