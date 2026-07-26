export type Tone = "green" | "amber" | "red" | "muted";

export const TONE_TEXT: Record<Tone, string> = {
  green: "text-green",
  amber: "text-amber",
  red: "text-red",
  muted: "text-muted",
};

export const TONE_DOT: Record<Tone, string> = {
  green: "bg-green shadow-[0_0_0_3px_var(--green-surface)]",
  amber: "bg-amber shadow-[0_0_0_3px_var(--amber-surface)]",
  red: "bg-red shadow-[0_0_0_3px_var(--red-surface)]",
  muted: "bg-muted shadow-[0_0_0_3px_var(--soft)]",
};

export const TONE_BADGE: Record<Tone, string> = {
  green: "bg-green-surface text-green border-green",
  amber: "bg-amber-surface text-amber border-amber",
  red: "bg-red-surface text-red border-red",
  muted: "bg-soft text-muted border-border",
};
