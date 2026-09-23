"use client";

import { useState } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/site/theme/hsv";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { HueSlider, SaturationArea } from "./pickerParts";

export const PICKER_POPOVER_WIDTH = 232;

/**
 * The colour picker, drawn by us so it looks and behaves the same in every browser
 * (the native one differs per browser and could not always be closed).
 */
export function ColorPicker({
  label,
  value,
  fallback,
  onChange,
  onDone,
}: {
  label: string;
  value: string;
  /** The shipped colour, offered as a one-click reset. */
  fallback: string;
  onChange: (hex: string) => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [lastSeen, setLastSeen] = useState(value);

  // A value from outside (the hex box, Default, Undo) moves the handles. Our own output
  // does not, so the hue survives dragging through grey, where hex has no hue.
  if (value !== lastSeen) {
    setLastSeen(value);
    setHsv(hexToHsv(value));
  }

  function pick(next: Hsv) {
    const hex = hsvToHex(next);
    setHsv(next);
    setLastSeen(hex);
    if (hex !== value) onChange(hex);
  }

  return (
    <div
      role="dialog"
      aria-label={label}
      style={{ width: PICKER_POPOVER_WIDTH }}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
    >
      <SaturationArea hsv={hsv} onChange={pick} />
      <HueSlider hsv={hsv} onChange={pick} />
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          style={{ background: value }}
          className="size-7 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgba(128,128,128,0.5)]"
        />
        <button
          type="button"
          onClick={() => onChange(fallback)}
          title={fallback}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[12px] text-muted hover:text-ink"
        >
          <span
            aria-hidden
            style={{ background: fallback }}
            className="size-3 rounded-sm shadow-[inset_0_0_0_1px_rgba(128,128,128,0.5)]"
          />
          {t("admin.appearance.colorPicker.default")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="ml-auto h-7 rounded-md bg-ink px-3 text-[12px] font-medium text-canvas"
        >
          {t("admin.appearance.colorPicker.done")}
        </button>
      </div>
    </div>
  );
}
