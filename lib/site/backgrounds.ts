import type { Bilingual } from "@/lib/content/types";

/**
 * Ready-made starting points for the background pair.
 *
 * These shipped before the full colour editor and `site_bg` still holds a live
 * choice, so they stay for two reasons: they migrate that choice forward (see
 * theme/read.ts), and they are the one-click way into the editor for someone who
 * only wants a different background and not eighteen decisions.
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
