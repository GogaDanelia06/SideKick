import type { Bilingual } from "@/lib/content/types";
import { defaultColors, type Shade, type ThemeColors } from "./tokens";

/**
 * One-click palettes, stored as patches over the default palette. Their `bg` and
 * `canvas` match the legacy `site_bg` presets that read.ts still migrates.
 */

export type Preset = {
  id: string;
  label: Bilingual;
  dark: Partial<ThemeColors>;
  light: Partial<ThemeColors>;
};

export const DEFAULT_PRESET = "default";

export const PRESETS: Preset[] = [
  {
    id: DEFAULT_PRESET,
    label: { ka: "ნაგულისხმევი", en: "Default" },
    dark: {},
    light: {},
  },
  {
    id: "slate",
    label: { ka: "ლურჯი", en: "Slate" },
    dark: { bg: "#0b1220", canvas: "#0b1220", card: "#121a2a", surface: "#121a2a", soft: "#18233a",
      siteBorder: "#1c2740", dashBorder: "#263353", border2: "#1a2437", muted: "#8593ad", faint: "#6b7a95" },
    light: { bg: "#f7f9fc", canvas: "#eef2f8", card: "#eef2f8", surface: "#ffffff", soft: "#f1f5fa",
      siteBorder: "#d3dceb", dashBorder: "#d3dceb", border2: "#e6ecf5", muted: "#55637a", faint: "#7d8ba3" },
  },
  {
    id: "warm",
    label: { ka: "თბილი", en: "Warm" },
    dark: { bg: "#15110e", canvas: "#15110e", card: "#1e1813", surface: "#1e1813", soft: "#261e17",
      siteBorder: "#2a211a", dashBorder: "#3a2e23", border2: "#241c15", muted: "#a08f7c", faint: "#8a7a68" },
    light: { bg: "#fdfaf6", canvas: "#faf5ef", card: "#f7f1e8", surface: "#fffdfa", soft: "#f4ece1",
      siteBorder: "#e3d8c8", dashBorder: "#e3d8c8", border2: "#efe6d9", muted: "#6b5d49", faint: "#8c7d66" },
  },
  {
    id: "forest",
    label: { ka: "მწვანე", en: "Forest" },
    dark: { bg: "#0a1410", canvas: "#0a1410", card: "#101d17", surface: "#101d17", soft: "#16281f",
      siteBorder: "#17281f", dashBorder: "#234133", border2: "#142720" },
    light: { bg: "#f4faf6", canvas: "#eff7f1", card: "#e9f3ec", surface: "#ffffff", soft: "#eaf4ed",
      siteBorder: "#cfe3d6", dashBorder: "#cfe3d6", border2: "#e2eee6" },
  },
  {
    id: "plum",
    label: { ka: "იასამნისფერი", en: "Plum" },
    dark: { bg: "#110e1a", canvas: "#110e1a", card: "#1a1526", surface: "#1a1526", soft: "#221b31",
      siteBorder: "#241d33", dashBorder: "#33284a", border2: "#1f1930", blue: "#a78bfa" },
    light: { bg: "#f9f7fd", canvas: "#f5f1fb", card: "#f1ecfa", surface: "#ffffff", soft: "#f2edfb",
      siteBorder: "#ddd3ee", dashBorder: "#ddd3ee", border2: "#eae3f6", blue: "#6d28d9" },
  },
  {
    id: "mono",
    label: { ka: "ნაცრისფერი", en: "Mono" },
    dark: { bg: "#0a0a0a", canvas: "#0a0a0a", card: "#141414", surface: "#141414", soft: "#1c1c1c",
      siteBorder: "#262626", dashBorder: "#303030", border2: "#1e1e1e", ink: "#f5f5f5",
      muted: "#a1a1a1", faint: "#8a8a8a" },
    light: { bg: "#ffffff", canvas: "#f7f7f7", card: "#f5f5f5", surface: "#ffffff", soft: "#f0f0f0",
      siteBorder: "#d4d4d4", dashBorder: "#d4d4d4", border2: "#e5e5e5", ink: "#171717",
      muted: "#525252", faint: "#6f6f6f" },
  },
];

export function findPreset(id: string | null | undefined): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** The preset, filled out into a complete palette. */
export function presetColors(preset: Preset, shade: Shade): ThemeColors {
  const out = defaultColors(shade);
  for (const [id, hex] of Object.entries(preset[shade])) {
    if (hex) out[id] = hex;
  }
  return out;
}

/** Three colours that stand for the look, for the swatch in the toolbar. */
export function presetSwatch(preset: Preset, shade: Shade): [string, string, string] {
  const c = presetColors(preset, shade);
  return [c.bg, c.surface, c.blue];
}
