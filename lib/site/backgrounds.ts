import type { Bilingual } from "@/lib/content/types";

/**
 * The page background, chosen once by the platform admin.
 *
 * Deliberately a short list rather than a colour picker. The background is the
 * one colour every other colour in the design sits on: text, cards, borders and
 * the translucent header are all tuned against it. A free hex field lets a
 * client pick something that makes their own site unreadable, and they would
 * only discover it after saving. Each preset here is a subtle tint of the
 * original, so text contrast stays where it was and cards still read as raised.
 *
 * Both surfaces move together — `bg` is the marketing site, `canvas` is
 * everything inside `.dash-scope` (the merchant dashboard *and* this admin
 * panel). Nothing else is touched: cards, ink, borders and accents keep their
 * values, which is what keeps a preset from being able to break a screen.
 */

export const BG_KEY = "site_bg";
export const DEFAULT_BACKGROUND = "default";

type Shade = { bg: string; canvas: string };

export type BackgroundPreset = {
  id: string;
  label: Bilingual;
  /** Shown in the admin swatch; not used for rendering. */
  swatch: string;
  dark: Shade;
  light: Shade;
};

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: DEFAULT_BACKGROUND,
    label: { ka: "ნაგულისხმევი", en: "Default" },
    swatch: "#0d1117",
    dark: { bg: "#0d1117", canvas: "#0d1117" },
    light: { bg: "#ffffff", canvas: "#f6f8fa" },
  },
  {
    id: "slate",
    label: { ka: "ლურჯი", en: "Slate" },
    swatch: "#0b1220",
    dark: { bg: "#0b1220", canvas: "#0b1220" },
    light: { bg: "#f7f9fc", canvas: "#eef2f8" },
  },
  {
    id: "warm",
    label: { ka: "თბილი", en: "Warm" },
    swatch: "#15110e",
    dark: { bg: "#15110e", canvas: "#15110e" },
    light: { bg: "#fdfaf6", canvas: "#faf5ef" },
  },
  {
    id: "forest",
    label: { ka: "მწვანე", en: "Forest" },
    swatch: "#0a1410",
    dark: { bg: "#0a1410", canvas: "#0a1410" },
    light: { bg: "#f4faf6", canvas: "#eff7f1" },
  },
  {
    id: "plum",
    label: { ka: "იასამნისფერი", en: "Plum" },
    swatch: "#110e1a",
    dark: { bg: "#110e1a", canvas: "#110e1a" },
    light: { bg: "#f9f7fd", canvas: "#f5f1fb" },
  },
];

/** Falls back to the default rather than throwing: a stored id that no longer
 *  exists should show the site as it shipped, not a blank page. */
export function findBackground(id: string | null | undefined): BackgroundPreset {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}

/** #rrggbb → rgba(), for the translucent sticky headers. */
function rgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * The override block injected into <head>.
 *
 * Every selector carries an extra `html` on the front. Not decoration: a <style>
 * element and the stylesheet <link> can land in either order depending on the
 * build, and `:root` against `:root` would then be decided by that order. The
 * added type selector wins on specificity instead, so the choice holds
 * regardless. Values come only from the list above, never from user input, so
 * there is nothing to escape.
 */
export function backgroundCss(id: string | null | undefined): string {
  const p = findBackground(id);
  return p.id === DEFAULT_BACKGROUND ? "" : cssFor(p);
}

/**
 * Same block, but emitted for the default too.
 *
 * The admin's live preview needs it: the page it is previewing on may already
 * carry a saved override, and "" would leave that override standing — picking
 * Default would then appear to do nothing.
 */
export function backgroundPreviewCss(id: string | null | undefined): string {
  return cssFor(findBackground(id));
}

function cssFor(p: BackgroundPreset): string {
  return [
    `html:root{--bg:${p.dark.bg};--header-bg:${rgba(p.dark.bg, 0.85)}}`,
    `html .dash-scope{--canvas:${p.dark.canvas}}`,
    `html:root[data-theme="light"]{--bg:${p.light.bg};--header-bg:${rgba(p.light.bg, 0.85)}}`,
    `html:root[data-theme="light"] .dash-scope{--canvas:${p.light.canvas}}`,
  ].join("");
}
