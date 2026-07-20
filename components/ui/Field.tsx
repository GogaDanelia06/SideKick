import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/** Labeled text input matching the auth-form styling. */
export function Field({
  label,
  hint,
  className,
  ...input
}: { label: ReactNode; hint?: ReactNode } & ComponentProps<"input">) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-muted">
        {label}
        {hint ? <span className="opacity-60"> {hint}</span> : null}
      </label>
      <input
        className={clsx(
          "w-full rounded-sm border border-input bg-bg px-3 py-2.5 text-sm text-ink outline-none",
          "placeholder:text-muted focus:border-blue",
          className,
        )}
        {...input}
      />
    </div>
  );
}
