import { toRgb } from "./derive";

/** Hue in degrees (0–360); saturation and value (brightness) from 0 to 1. */
export type Hsv = { h: number; s: number; v: number };

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const spread = max - Math.min(r, g, b);

  let h = 0;
  if (spread > 0) {
    if (max === r) h = (g - b) / spread;
    else if (max === g) h = (b - r) / spread + 2;
    else h = (r - g) / spread + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : spread / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255).toString(16).padStart(2, "0");
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}
