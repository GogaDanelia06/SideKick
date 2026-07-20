import type { Bilingual } from "./types";

/** `accent` renders the segment in the brand green (e.g. the "+" or "₾"). */
export type StatPart = { text: string; accent?: boolean };
export type Stat = { parts: StatPart[]; label: Bilingual };

export const STATS: Stat[] = [
  {
    parts: [{ text: "1,200" }, { text: "+", accent: true }],
    label: { ka: "მომხმარებელი ჯამში", en: "Users in total" },
  },
  {
    parts: [{ text: "8,540" }],
    label: { ka: "აქტიური ჩატი დღეს", en: "Active chats today" },
  },
  {
    parts: [{ text: "2.4M" }, { text: "₾", accent: true }],
    label: { ka: "გაყიდული პროდუქცია ბოტებით", en: "Products sold via bots" },
  },
];
