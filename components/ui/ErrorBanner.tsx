import clsx from "clsx";
import type { ReactNode } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

export function ErrorBanner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        className,
        "flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red",
      )}
    >
      <IconAlertTriangle size={16} className="shrink-0" />
      {children}
    </div>
  );
}
