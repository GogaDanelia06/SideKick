import type { Bilingual } from "@/lib/content/types";

/** A format name rather than a function, so it can cross to the client. */
export type StatFormat = "number" | "money";

export type StatSourceOption = { key: string; label: Bilingual; format: StatFormat; value: string };

const nf = new Intl.NumberFormat("en-US");

/** Big money reads better shortened: 2,400,000 → 2.4M. */
function money(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1).replace(/\.0$/, "")}M₾`;
  if (total >= 1_000) return `${Math.round(total / 1_000)}K₾`;
  return `${nf.format(total)}₾`;
}

export function formatStat(n: number, format: StatFormat): string {
  const rounded = Math.round(n);
  return format === "money" ? money(rounded) : nf.format(rounded);
}
