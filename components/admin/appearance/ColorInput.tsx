"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconRotate2 } from "@tabler/icons-react";
import { isHex } from "@/lib/site/theme/derive";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ColorPicker, PICKER_POPOVER_WIDTH } from "./ColorPicker";
import { PICKER_WIDTH } from "./shades";
import { usePopover } from "./usePopover";

/** The popover's footprint; 250 is its height with some room to spare. */
const POPOVER = { width: PICKER_POPOVER_WIDTH, height: 250 };

/** One theme's value of one colour: a swatch that opens our picker, and a hex box. */
export function ColorInput({
  label,
  value,
  saved,
  fallback,
  onChange,
  onFocus,
}: {
  label: string;
  value: string;
  /** The value on the server, so this one field can be undone. */
  saved: string;
  /** The shipped value. */
  fallback: string;
  onChange: (hex: string) => void;
  onFocus: () => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState(value);
  const [lastSeen, setLastSeen] = useState(value);
  const { open, place, box, trigger, toggle, close } = usePopover(POPOVER);

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
      ref={box}
      onFocus={onFocus}
      className={clsx(
        "relative grid grid-cols-[28px_minmax(0,1fr)_22px] items-center gap-1.5 rounded-lg border p-1",
        PICKER_WIDTH,
        changed ? "border-blue bg-blue-surface" : "border-border",
      )}
    >
      <button
        ref={trigger}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{ background: value }}
        className="size-7 cursor-pointer rounded-md shadow-[inset_0_0_0_1px_rgba(128,128,128,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-blue-ring"
      />
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
          title={t("admin.appearance.colorInput.undoThisChange")}
          aria-label={`${label}: ${t("admin.appearance.colorInput.undoThisChange")}`}
          className="grid size-[22px] place-items-center rounded-md text-blue hover:bg-blue-surface"
        >
          <IconRotate2 size={14} />
        </button>
      ) : (
        <span aria-hidden />
      )}

      {open ? (
        <div
          className={clsx(
            "absolute z-30",
            place.right ? "right-0" : "left-0",
            place.up ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          <ColorPicker label={label} value={value} fallback={fallback} onChange={onChange} onDone={close} />
        </div>
      ) : null}
    </div>
  );
}
