"use client";

import type { SiteStat } from "@prisma/client";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";

const TOOLS: RowLabels = {
  up: "admin.stats.editor.moveUp",
  down: "admin.stats.editor.moveDown",
  edit: "admin.stats.editor.edit",
  remove: "admin.stats.editor.delete",
};

export function StatRow({
  stat,
  sources,
  first,
  last,
  pending,
  onMove,
  onEdit,
  onRemove,
}: {
  stat: SiteStat;
  sources: StatSourceOption[];
  first: boolean;
  last: boolean;
  pending: boolean;
  onMove: (direction: "up" | "down") => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();

  return (
      <div className="flex items-center gap-4">
        <div className="font-mono text-2xl font-medium tabular-nums">
          {stat.mode === "LIVE"
            ? (sources.find((o) => o.key === stat.source)?.value ?? "—")
            : stat.mode === "AUTO"
              ? Math.round(stat.autoValue ?? stat.baseValue).toLocaleString("en-US")
              : stat.value}
          {stat.suffix}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{stat.labelKa}</div>
          <div className="truncate text-[13px] text-muted">
            {stat.mode === "LIVE"
              ? t(sources.find((o) => o.key === stat.source)?.label ?? { ka: stat.source, en: stat.source })
              : stat.mode === "AUTO"
                ? `+${stat.changeMin}…${stat.changeMax} / ${Math.round(stat.intervalMinMs / 1000)}–${Math.round(stat.intervalMaxMs / 1000)}${t("admin.stats.editor.s")}`
                : stat.labelEn}
          </div>
        </div>
        {stat.mode === "LIVE" ? (
          <span className="shrink-0 rounded-full bg-green-surface px-2 py-0.5 text-[11px] text-green">
            {t("admin.stats.editor.live")}
          </span>
        ) : null}
        {stat.mode === "AUTO" ? (
          <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
            {t("admin.stats.editor.automatic")}
          </span>
        ) : null}
        <RowTools
          className="flex items-center gap-1"
          first={first}
          last={last}
          pending={pending}
          labels={TOOLS}
          onMove={onMove}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>
  );
}
