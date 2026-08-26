import type { Shade, ThemeColors } from "./tokens";

/**
 * The colours that are *not* editable, worked out from the ones that are.
 *
 * globals.css carries about a dozen values that only exist to stay in step with
 * a base colour: the translucent sticky headers, the pale fills behind status
 * chips, the button hover, the tint of blue used for text on a blue background.
 * Exposing those as their own fields would be eighteen more inputs and a new way
 * to end up with a green chip on an amber background. They are computed here
 * instead, so they cannot drift.
 */

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

/**
 * Everything derived, split by the scope it belongs to.
 *
 * The shade matters: a hover state is *lighter* than its button on a dark
 * background and *darker* on a light one, and the same is true of the readable
 * ink used on a tinted surface. One formula for both would look wrong in one of
 * them, which is why `shade` is a parameter rather than an assumption.
 */
export function derived(c: ThemeColors, shade: Shade): { root: ThemeColors; dash: ThemeColors } {
  const dark = shade === "dark";
  const toward = dark ? WHITE : BLACK;

  return {
    root: {
      // A card sitting on a card. In the dark palette it is a step *away* from
      // the page; in the light one the page itself is already the brighter of
      // the two, so it borrows that. One formula for both made nested cards
      // vanish in light mode.
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
