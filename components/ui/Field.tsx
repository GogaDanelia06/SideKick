"use client";

import clsx from "clsx";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export function Field({
  label,
  hint,
  className,
  type,
  ...input
}: { label: ReactNode; hint?: ReactNode } & ComponentProps<"input">) {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-muted">
        {label}
        {hint && <span className="opacity-60"> {hint}</span>}
      </label>

      <div className="relative">
        <input
          {...input}
          type={isPassword ? (show ? "text" : "password") : type}
          className={clsx(
            "w-full rounded-sm border border-input bg-bg px-3 py-2.5 text-sm text-ink outline-none",
            "placeholder:text-muted focus:border-blue",
            isPassword && "pr-11",
            className,
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            {show ? (
              <IconEyeOff size={18} />
            ) : (
              <IconEye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}