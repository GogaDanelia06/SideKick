"use client";

import clsx from "clsx";
import { useId, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
} & ComponentProps<"input">;

export function Field({
  label,
  hint,
  error,
  className,
  type,
  id,
  ...input
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = type === "password";
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-[13px] text-muted">
        {label}
        {hint && <span className="opacity-60"> {hint}</span>}
      </label>

      <div className="relative">
        <input
          {...input}
          id={inputId}
          type={isPassword ? (show ? "text" : "password") : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : input["aria-describedby"]}
          className={clsx(
            "w-full rounded-sm border border-input bg-bg px-3 py-2.5 text-sm text-ink outline-none",
            "placeholder:text-muted focus:border-blue",
            error && "border-red focus:border-red",
            isPassword && "pr-11",
            className,
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-[12px] leading-4 text-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
