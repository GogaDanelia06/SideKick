import type { Shade, ThemeColors } from "./tokens";

/** Non-editable colours (hovers, tinted fills, translucent headers) derived from the editable ones. */

type Rgb = [number, number, number];

const HEX = /^#[0-9a-f]{6}$/i;

export function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

function toRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** `t` of the way from `a` to `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as Rgb);
}

/** Relative luminance, per WCAG. */
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const WHITE = "#ffffff";
const BLACK = "#000000";

/** Derived variables per scope. Hover and ink shifts go lighter on dark, darker on light. */
export function derived(c: ThemeColors, shade: Shade): { root: ThemeColors; dash: ThemeColors } {
  const dark = shade === "dark";
  const toward = dark ? WHITE : BLACK;

  return {
    root: {
      // Nested cards: a lighter step on dark; the page colour on light.
      "--card2": dark ? mix(c.card, WHITE, 0.05) : c.bg,
      "--sidebar": c.card,
      "--primary-h": mix(c.primary, toward, dark ? 0.16 : 0.1),
      "--header-bg": rgba(c.bg, 0.85),
      "--purple": c.ai,
      "--blue-surface": rgba(c.blue, 0.13),
      "--blue-border": rgba(c.blue, 0.27),
      "--blue-ring": rgba(c.blue, 0.4),
      "--blue-ink": mix(c.blue, toward, dark ? 0.7 : 0.62),
    },
    dash: {
      "--topbar-bg": rgba(c.surface, 0.9),
      "--green-surface": rgba(c.green, 0.13),
      "--amber-surface": rgba(c.amber, 0.13),
      "--red-surface": rgba(c.red, 0.13),
      "--ai-surface": rgba(c.ai, 0.13),
    },
  };
}
