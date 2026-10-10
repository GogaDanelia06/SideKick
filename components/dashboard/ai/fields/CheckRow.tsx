import clsx from "clsx";
import type { ReactNode } from "react";

export function CheckRow({
  name,
  label,
  defaultChecked,
  className,
}: {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label className={clsx("flex cursor-pointer items-center gap-2.5 text-[13px] font-medium", className)}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}
