"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { HeroSlideStat } from "@prisma/client";
import { IconBolt, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { createSlideStat, updateSlideStat, deleteSlideStat } from "@/lib/admin/actions/heroStats";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-2.5 py-1.5 text-[13px] outline-none placeholder:text-faint focus:border-blue disabled:opacity-45";
const LABEL = "mb-1 block text-[10px] uppercase tracking-wide text-faint";

/** One slide figure: pick a counter, or fill in the manual fields (disabled once a counter is picked). */
function StatFields({
  initial,
  sources,
}: {
  initial?: HeroSlideStat;
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const [source, setSource] = useState(initial?.source ?? "");
  const auto = source !== "";
  const picked = sources.find((s) => s.key === source);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.labelGeorgian")}</span>
          <input name="labelKa" required defaultValue={initial?.labelKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.labelEnglish")}</span>
          <input name="labelEn" required defaultValue={initial?.labelEn} className={INPUT} />
        </label>
      </div>

      <label className="block">
        <span className={LABEL}>{t("admin.hero.slideStats.whereTheFigureComes")}</span>
        <select
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={INPUT}
        >
          <option value="">{t("admin.hero.slideStats.byHandADrifting")}</option>
          {sources.map((s) => (
            <option key={s.key} value={s.key}>
              {t(s.label)} — {s.value}
            </option>
          ))}
        </select>
      </label>

      {auto ? (
        <p className="flex items-start gap-1.5 rounded-[6px] bg-green-surface/40 px-2.5 py-2 text-[12px] text-green">
          <IconBolt size={14} className="mt-[1px] shrink-0" />
          {t("admin.hero.slideStats.rightNow", { value: picked?.value ?? "—" })}
        </p>
      ) : (
        <p className="rounded-[6px] bg-soft px-2.5 py-2 text-[12px] text-muted">
          {t("admin.hero.slideStats.aHandMadeFigure")}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-4">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.startValue")}</span>
          <input
            name="baseValue"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.baseValue ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.changeMin")}</span>
          <input
            name="changeMin"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.changeMin ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.changeMax")}</span>
          <input
            name="changeMax"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.changeMax ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.suffix")}</span>
          <input name="suffix" defaultValue={initial?.suffix} placeholder="₾ / %" className={INPUT} />
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.intervalMinMs")}</span>
          <input
            name="intervalMinMs"
            type="number"
            disabled={auto}
            defaultValue={initial?.intervalMinMs ?? 2000}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.intervalMaxMs")}</span>
          <input
            name="intervalMaxMs"
            type="number"
            disabled={auto}
            defaultValue={initial?.intervalMaxMs ?? 6000}
            className={INPUT}
          />
        </label>
      </div>
    </div>
  );
}

export function SlideStats({
  slideId,
  stats,
  sources,
}: {
  slideId: string;
  stats: HeroSlideStat[];
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const addRef = useRef<HTMLFormElement>(null);

  // Optimistic removal; React restores the figure if the server refuses.
  const [visible, removeOptimistic] = useOptimistic(
    stats,
    (rows: HeroSlideStat[], id: string) => rows.filter((r) => r.id !== id),
  );

  function run(fn: () => Promise<{ ok: boolean }>, onDone?: () => void) {
    start(async () => {
      const res = await fn();
      if (res.ok) onDone?.();
    });
  }

  function remove(id: string) {
    start(async () => {
      removeOptimistic(id);
      await deleteSlideStat(id);
    });
  }

  return (
    <div className="mt-3 rounded-[8px] border border-border2 bg-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted">
          {t("admin.hero.slideStats.figuresOnTheSlide")} · {visible.length}
        </span>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex h-7 items-center gap-1 rounded-[6px] border border-border px-2 text-[12px]"
        >
          {adding ? <IconX size={13} /> : <IconPlus size={13} />}
          {adding ? t("admin.hero.slideStats.close") : t("admin.hero.slideStats.add")}
        </button>
      </div>

      {adding ? (
        <form
          ref={addRef}
          action={(fd) => run(() => createSlideStat(slideId, fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="mb-2 rounded-[8px] border border-border bg-card p-2.5"
        >
          <StatFields sources={sources} />
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={pending} className="h-7 rounded-[6px] bg-ink px-3 text-[12px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t("admin.hero.slideStats.add")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {visible.map((s) => {
          const picked = s.source ? sources.find((o) => o.key === s.source) : undefined;
          return (
            <div key={s.id} className="rounded-[8px] border border-border bg-card p-2.5">
              {editing === s.id ? (
                <form action={(fd) => run(() => updateSlideStat(s.id, fd), () => setEditing(null))}>
                  <StatFields initial={s} sources={sources} />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setEditing(null)} className="h-7 rounded-[6px] border border-border px-3 text-[12px]">
                      {t("admin.hero.slideStats.cancel")}
                    </button>
                    <button type="submit" disabled={pending} className="h-7 rounded-[6px] bg-ink px-3 text-[12px] font-medium text-canvas disabled:opacity-60">
                      {pending ? "…" : t("admin.hero.slideStats.save")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-medium tabular-nums">
                    {picked ? picked.value : s.baseValue}
                    {s.suffix}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{s.labelKa}</span>
                  {picked ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-surface px-2 py-0.5 text-[11px] text-green">
                      <IconBolt size={11} />
                      {t("admin.hero.slideStats.live")}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] text-faint">
                      +{s.changeMin}…{s.changeMax} / {s.intervalMinMs}–{s.intervalMaxMs}ms
                    </span>
                  )}
                  <button type="button" onClick={() => setEditing(s.id)} className="text-[12px] text-blue">
                    {t("admin.hero.slideStats.edit")}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(s.id)}
                    aria-label={t("admin.hero.slideStats.delete")}
                    className="grid size-7 shrink-0 place-items-center rounded-[6px] border border-border text-red hover:border-red disabled:opacity-40"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
