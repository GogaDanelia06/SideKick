import type { Bilingual } from "@/lib/content/types";

/**
 * How a counted figure is written out.
 *
 * Kept apart from the counters themselves because both sides need it: the
 * server writes the first paint, and the browser rewrites the same number on
 * every frame while it climbs. A function could not cross that boundary — a
 * name can.
 */
export type StatFormat = "number" | "money";

/** Shape of one counter as the admin panel and the public page see it. */
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
