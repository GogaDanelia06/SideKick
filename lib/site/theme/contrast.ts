import type { Bilingual } from "@/lib/content/types";
import { luminance } from "./derive";
import type { ThemeColors } from "./tokens";

/**
 * Which pairs have to stay readable, and how readable.
 *
 * A free colour picker can produce grey text on a grey background, and the
 * person choosing it is looking at one screen out of a dozen when they do. These
 * are the pairs that actually carry words. 4.5 is the WCAG AA threshold for body
 * text; 3 is the large-text and non-essential-hint threshold.
 */

type Pair = { fg: keyof ThemeColors; bg: keyof ThemeColors; label: Bilingual; min: number };

export const PAIRS: Pair[] = [
  { fg: "ink", bg: "bg", min: 4.5, label: { ka: "ტექსტი საიტის ფონზე", en: "Text on the site background" } },
  { fg: "ink", bg: "card", min: 4.5, label: { ka: "ტექსტი ბარათზე", en: "Text on a card" } },
  { fg: "muted", bg: "bg", min: 4.5, label: { ka: "მეორეული ტექსტი საიტზე", en: "Secondary text on the site" } },
  { fg: "ink", bg: "canvas", min: 4.5, label: { ka: "ტექსტი დაშბორდის ფონზე", en: "Text on the dashboard background" } },
  { fg: "ink", bg: "surface", min: 4.5, label: { ka: "ტექსტი მენიუსა და ბარათებზე", en: "Text on the sidebar and cards" } },
  { fg: "muted", bg: "canvas", min: 4.5, label: { ka: "მეორეული ტექსტი დაშბორდში", en: "Secondary text in the dashboard" } },
  { fg: "faint", bg: "surface", min: 3, label: { ka: "მინიშნებები", en: "Hints" } },
  { fg: "blue", bg: "surface", min: 3, label: { ka: "ბმულები ბარათზე", en: "Links on a card" } },
];

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function ratio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

export type Failure = { label: Bilingual; ratio: number; min: number };

/** Only what falls short — a list of everything that passes is noise. */
export function failures(colors: ThemeColors): Failure[] {
  return PAIRS.flatMap((p) => {
    const value = ratio(colors[p.fg], colors[p.bg]);
    return value < p.min ? [{ label: p.label, ratio: value, min: p.min }] : [];
  });
}
