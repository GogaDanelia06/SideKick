"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { hsvToHex, type Hsv } from "@/lib/site/theme/hsv";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Point = { x: number; y: number };

const clamp = (n: number) => Math.min(1, Math.max(0, n));

const HANDLE =
  "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]";

const AREA = "relative w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-blue-ring";

/** Reports where the pointer is inside the element (0–1 on both axes) while it is held down. */
function drag(onMove: (p: Point) => void) {
  const at = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onMove({ x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) });
  };
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      at(e);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) at(e);
    },
  };
}

/** Arrow keys move 1%, or 10% with Shift. */
function arrows(e: KeyboardEvent, onStep: (dx: number, dy: number) => void) {
  const step = e.shiftKey ? 0.1 : 0.01;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const move = moves[e.key];
  if (!move) return;
  e.preventDefault();
  onStep(...move);
}

/** Saturation left to right, brightness bottom to top, for the current hue. */
export function SaturationArea({ hsv, onChange }: { hsv: Hsv; onChange: (next: Hsv) => void }) {
  const { t } = useLanguage();
  const set = ({ x, y }: Point) => onChange({ ...hsv, s: x, v: 1 - y });

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t({ ka: "გაჯერებულობა და სიკაშკაშე", en: "Saturation and brightness" })}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.s * 100)}
      aria-valuetext={`${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%`}
      {...drag(set)}
      onKeyDown={(e) => arrows(e, (dx, dy) => set({ x: clamp(hsv.s + dx), y: clamp(1 - hsv.v + dy) }))}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
      }}
      className={`${AREA} h-36 cursor-crosshair rounded-lg`}
    >
      <span
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hsvToHex(hsv) }}
        className={HANDLE}
      />
    </div>
  );
}

const RAINBOW = "linear-gradient(to right, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00)";

/** The hue, around the colour wheel from red back to red. */
export function HueSlider({ hsv, onChange }: { hsv: Hsv; onChange: (next: Hsv) => void }) {
  const { t } = useLanguage();
  const set = (x: number) => onChange({ ...hsv, h: x * 360 });

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t({ ka: "ელფერი", en: "Hue" })}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hsv.h)}
      {...drag(({ x }) => set(x))}
      onKeyDown={(e) => arrows(e, (dx, dy) => set(clamp(hsv.h / 360 + (dx || -dy))))}
      style={{ background: RAINBOW }}
      className={`${AREA} h-3.5 cursor-pointer rounded-full`}
    >
      <span
        style={{ left: `${(hsv.h / 360) * 100}%`, top: "50%", background: `hsl(${hsv.h} 100% 50%)` }}
        className={HANDLE}
      />
    </div>
  );
}
