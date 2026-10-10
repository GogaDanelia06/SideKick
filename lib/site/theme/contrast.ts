import { luminance } from "./derive";
import type { ThemeColors } from "./tokens";
import type { Text } from "@/lib/i18n/messages";

type Pair = { fg: keyof ThemeColors; bg: keyof ThemeColors; label: Text; min: number };

export const PAIRS: Pair[] = [
  { fg: "ink", bg: "bg", min: 4.5, label: "site.theme.contrast.textOnTheSite" },
  { fg: "ink", bg: "card", min: 4.5, label: "site.theme.contrast.textOnACard" },
  { fg: "muted", bg: "bg", min: 4.5, label: "site.theme.contrast.secondaryTextOnThe" },
  { fg: "ink", bg: "canvas", min: 4.5, label: "site.theme.contrast.textOnTheDashboard" },
  { fg: "ink", bg: "surface", min: 4.5, label: "site.theme.contrast.label" },
  { fg: "muted", bg: "canvas", min: 4.5, label: "site.theme.contrast.secondaryTextInThe" },
  { fg: "faint", bg: "surface", min: 3, label: "site.theme.contrast.hints" },
  { fg: "blue", bg: "surface", min: 3, label: "site.theme.contrast.linksOnACard" },
];

export function ratio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

export type Failure = { label: Text; ratio: number; min: number };

export function failures(colors: ThemeColors): Failure[] {
  return PAIRS.flatMap((p) => {
    const value = ratio(colors[p.fg], colors[p.bg]);
    return value < p.min ? [{ label: p.label, ratio: value, min: p.min }] : [];
  });
}
