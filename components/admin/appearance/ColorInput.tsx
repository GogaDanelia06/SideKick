"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconRotate2 } from "@tabler/icons-react";
import { isHex } from "@/lib/site/theme/derive";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PICKER_WIDTH } from "./shades";

/** One theme's value of one colour: a swatch that opens the picker, and a hex box. */
export function ColorInput({
  label,
  value,
  saved,
  onChange,
  onFocus,
}: {
  label: string;
  value: string;
  /** The value on the server, so this one field can be undone. */
  saved: string;
  onChange: (hex: string) => void;
  onFocus: () => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState(value);
  const [lastSeen, setLastSeen] = useState(value);

  // Sync with outside changes during render, so a stale value is never painted.
  if (value !== lastSeen) {
    setLastSeen(value);
    setText(value);
  }

  // Typed text is reported only once it is a full hex.
  function typed(next: string) {
    const withHash = next.startsWith("#") ? next : `#${next}`;
    setText(withHash);
    if (isHex(withHash)) onChange(withHash.toLowerCase());
  }

  const changed = value !== saved;

  return (
    <div
      onFocus={onFocus}
      className={clsx(
        "grid grid-cols-[28px_minmax(0,1fr)_22px] items-center gap-1.5 rounded-lg border p-1",
        PICKER_WIDTH,
        changed ? "border-blue bg-blue-surface" : "border-border",
      )}
    >
      {/* An invisible native colour input over a painted swatch; the inset line keeps dark colours visible. */}
      <span
        style={{ background: value }}
        className="relative size-7 overflow-hidden rounded-md shadow-[inset_0_0_0_1px_rgba(128,128,128,0.5)] focus-within:ring-2 focus-within:ring-blue-ring"
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </span>
      <input
        value={text}
        onChange={(e) => typed(e.target.value)}
        onBlur={() => setText(value)}
        spellCheck={false}
        maxLength={7}
        aria-label={`${label} hex`}
        className="w-full rounded-[6px] border border-input bg-canvas px-1.5 py-1 font-mono text-[12px] text-ink outline-none focus:border-blue"
      />
      {changed ? (
        <button
          type="button"
          onClick={() => onChange(saved)}
          title={t({ ka: "დაბრუნება", en: "Undo this change" })}
          aria-label={`${label}: ${t({ ka: "დაბრუნება", en: "Undo this change" })}`}
          className="grid size-[22px] place-items-center rounded-md text-blue hover:bg-blue-surface"
        >
          <IconRotate2 size={14} />
        </button>
      ) : (
        <span aria-hidden />
      )}
    </div>
  );
}
