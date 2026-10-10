"use client";

import type { HeroSlideStat } from "@prisma/client";
import { IconBolt, IconTrash } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";

export function SlideStatRow({
  stat,
  sources,
  pending,
  onEdit,
  onRemove,
}: {
  stat: HeroSlideStat;
  sources: StatSourceOption[];
  pending: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const picked = stat.source ? sources.find((o) => o.key === stat.source) : undefined;

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[15px] font-medium tabular-nums">
        {picked ? picked.value : stat.baseValue}
        {stat.suffix}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{stat.labelKa}</span>
      {picked ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-surface px-2 py-0.5 text-[11px] text-green">
          <IconBolt size={11} />
          {t("admin.hero.slideStats.live")}
        </span>
      ) : (
        <span className="shrink-0 text-[11px] text-faint">
          +{stat.changeMin}…{stat.changeMax} / {stat.intervalMinMs}–{stat.intervalMaxMs}ms
        </span>
      )}
      <button type="button" onClick={onEdit} className="text-[12px] text-blue">
        {t("admin.hero.slideStats.edit")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onRemove}
        aria-label={t("admin.hero.slideStats.delete")}
        className="grid size-7 shrink-0 place-items-center rounded-[6px] border border-border text-red hover:border-red disabled:opacity-40"
      >
        <IconTrash size={13} />
      </button>
    </div>
  );
}
