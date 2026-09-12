import type { SiteStat } from "@prisma/client";
import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { Bilingual } from "@/lib/content/types";
import { autoKey, readAutoStat } from "@/lib/site/autoStat";
import { formatStat, type StatFormat } from "@/lib/site/statFormat";
import { countStat, findStatSource } from "@/lib/site/statSources";

export type SiteStatView = {
  value: string;
  label: Bilingual;
  /** `auto` figures are decorative, so they are never badged as live. */
  kind: "fixed" | "counted" | "auto";
  /** Key in the live payload (a counter key or an `auto:` key); "" for fixed figures. */
  liveKey: string;
  /** The raw number behind `value`, for client-side animation. */
  n: number | null;
  format: StatFormat;
  suffix: string;
};

type Figure = Pick<SiteStatView, "value" | "kind" | "liveKey" | "n" | "format">;

function view(row: SiteStat, figure: Figure): SiteStatView {
  return { ...figure, label: bilingual(row.labelKa, row.labelEn), suffix: row.suffix };
}

async function statView(row: SiteStat): Promise<SiteStatView> {
  if (row.mode === "AUTO") {
    const n = await readAutoStat(row);
    return view(row, { value: formatStat(n, "number"), kind: "auto", liveKey: autoKey(row.key), n, format: "number" });
  }

  const source = row.mode === "LIVE" && row.source ? findStatSource(row.source) : undefined;
  const n = source ? await countStat(source) : null;
  if (!source || n === null) {
    return view(row, { value: row.value, kind: "fixed", liveKey: "", n: null, format: "number" });
  }
  return view(row, { value: formatStat(n, source.format), kind: "counted", liveKey: row.source, n, format: source.format });
}

/** Landing strip figures. A missing or failing counter falls back to the stored value. */
export async function getSiteStats(): Promise<SiteStatView[]> {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  return Promise.all(rows.map(statView));
}
