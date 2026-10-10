import { prisma } from "@/lib/db";
import { countStat, findStatSource } from "@/lib/site/statSources";
import { formatStat, type StatFormat } from "@/lib/site/statFormat";
import { autoKey, readAutoStat } from "@/lib/site/autoStat";
import type { Bilingual } from "@/lib/content/types";

export type SiteStatView = {
  value: string;
  label: Bilingual;
  kind: "fixed" | "counted" | "auto";
  liveKey: string;
  n: number | null;
  format: StatFormat;
  suffix: string;
};

function fixed(
  r: { value: string; labelKa: string; labelEn: string; suffix: string },
): SiteStatView {
  return {
    value: r.value,
    label: { ka: r.labelKa, en: r.labelEn },
    kind: "fixed",
    liveKey: "",
    n: null,
    format: "number",
    suffix: r.suffix,
  };
}

export async function getSiteStats(): Promise<SiteStatView[]> {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });

  return Promise.all(
    rows.map(async (r): Promise<SiteStatView> => {
      if (r.mode === "AUTO") {
        const n = await readAutoStat(r);
        return {
          value: formatStat(n, "number"),
          label: { ka: r.labelKa, en: r.labelEn },
          kind: "auto",
          liveKey: autoKey(r.key),
          n,
          format: "number",
          suffix: r.suffix,
        };
      }

      if (r.mode !== "LIVE") return fixed(r);

      const source = r.source ? findStatSource(r.source) : undefined;
      if (!source) return fixed(r);

      const n = await countStat(source);
      if (n === null) return fixed(r);

      return {
        value: formatStat(n, source.format),
        label: { ka: r.labelKa, en: r.labelEn },
        kind: "counted",
        liveKey: r.source,
        n,
        format: source.format,
        suffix: r.suffix,
      };
    }),
  );
}
