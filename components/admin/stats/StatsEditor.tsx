"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { SiteStat } from "@prisma/client";
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { createStat, updateStat, deleteStat, moveStat } from "@/lib/admin/actions/stats";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import type { Text } from "@/lib/i18n/messages";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Text> = {
  all_fields_required: "admin.stats.editor.fillInEveryField",
  not_found: "admin.stats.editor.notFound",
  unknown_source: "admin.stats.editor.pickACounter",
  bad_mode: "admin.stats.editor.pickHowTheFigure",
  value_required: "admin.stats.editor.typeAFigure",
};

const SMALL = "h-9 w-full rounded-[8px] border border-input bg-canvas px-2.5 text-[13px] outline-none focus:border-blue";
const FIELD_LABEL = "mb-1 block text-[10px] uppercase tracking-wide text-faint";

type Mode = "MANUAL" | "LIVE" | "AUTO";

type Fields = {
  mode: Mode;
  value: string;
  source: string;
  labelKa: string;
  labelEn: string;
  suffix: string;
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
};

const MODES: { key: Mode; label: Text; hint: Text }[] = [
  {
    key: "MANUAL",
    label: "admin.stats.editor.byHand",
    hint: "admin.stats.editor.hint",
  },
  {
    key: "AUTO",
    label: "admin.stats.editor.automaticGrowth",
    hint: "admin.stats.editor.hint2",
  },
  {
    key: "LIVE",
    label: "admin.stats.editor.liveCounter",
    hint: "admin.stats.editor.hint3",
  },
];

/** One strip figure: typed, drifting or counted, chosen with tabs. */
function StatFields({ initial, sources }: { initial?: Fields; sources: StatSourceOption[] }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>(initial?.mode ?? "MANUAL");
  const [source, setSource] = useState(initial?.source ?? sources[0]?.key ?? "");
  const picked = sources.find((s) => s.key === source);
  const active = MODES.find((m) => m.key === mode);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input
          name="labelKa"
          required
          defaultValue={initial?.labelKa}
          placeholder={t("admin.stats.editor.labelKa")}
          className={INPUT}
        />
        <input
          name="labelEn"
          required
          defaultValue={initial?.labelEn}
          placeholder={t("admin.stats.editor.labelEn")}
          className={INPUT}
        />
      </div>

      <input type="hidden" name="mode" value={mode} />
      <div className="flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`h-8 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
              mode === m.key
                ? "border-blue bg-blue-surface text-blue"
                : "border-border text-muted hover:text-ink"
            }`}
          >
            {t(m.label)}
          </button>
        ))}
      </div>
      {active ? <p className="text-[12px] text-muted">{t(active.hint)}</p> : null}

      {mode === "MANUAL" ? (
        <div className="grid gap-2.5 sm:grid-cols-[1fr_120px]">
          <input
            name="value"
            required
            defaultValue={initial?.value}
            placeholder={t("admin.stats.editor.figureEG1")}
            className={INPUT}
          />
          <input
            name="suffix"
            defaultValue={initial?.suffix}
            placeholder={t("admin.stats.editor.suffix")}
            className={INPUT}
          />
        </div>
      ) : null}

      {mode === "LIVE" ? (
        <>
          <select
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={INPUT}
          >
            {sources.map((s) => (
              <option key={s.key} value={s.key}>
                {t(s.label)} — {s.value}
              </option>
            ))}
          </select>
          <p className="text-[12px] text-green">
            {t("admin.stats.editor.rightNow", { value: picked?.value ?? "—" })}
          </p>
        </>
      ) : null}

      {mode === "AUTO" ? (
        <div className="grid gap-2.5 rounded-[8px] border border-border2 bg-soft p-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className={FIELD_LABEL}>{t("admin.stats.editor.startValue")}</span>
              <input
                name="baseValue"
                type="number"
                step="any"
                defaultValue={initial?.baseValue ?? 1000}
                className={SMALL}
              />
            </label>
            <label className="block">
              <span className={FIELD_LABEL}>{t("admin.stats.editor.suffix")}</span>
              <input name="suffix" defaultValue={initial?.suffix} placeholder="₾ / % / +" className={SMALL} />
            </label>
          </div>

          <div>
            <span className={FIELD_LABEL}>
              {t("admin.stats.editor.howMuchItGrows")}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                name="changeMin"
                type="number"
                step="any"
                defaultValue={initial?.changeMin ?? 1}
                className={SMALL}
              />
              <input
                name="changeMax"
                type="number"
                step="any"
                defaultValue={initial?.changeMax ?? 3}
                className={SMALL}
              />
            </div>
          </div>

          <div>
            <span className={FIELD_LABEL}>
              {t("admin.stats.editor.howOftenInSeconds")}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                name="intervalMinS"
                type="number"
                min={5}
                defaultValue={Math.round((initial?.intervalMinMs ?? 60_000) / 1000)}
                className={SMALL}
              />
              <input
                name="intervalMaxS"
                type="number"
                min={5}
                defaultValue={Math.round((initial?.intervalMaxMs ?? 300_000) / 1000)}
                className={SMALL}
              />
            </div>
          </div>

          <p className="text-[12px] text-amber">
            {t("admin.stats.editor.savingRestartsTheFigure")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function StatsEditor({
  stats,
  sources,
}: {
  stats: SiteStat[];
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addRef = useRef<HTMLFormElement>(null);

  // Optimistic removal; React restores the row if the server refuses.
  const [visible, removeOptimistic] = useOptimistic(stats, (rows: SiteStat[], id: string) =>
    rows.filter((r) => r.id !== id),
  );

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, onDone?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "error");
      else onDone?.();
    });
  }

  function remove(id: string) {
    setError(null);
    start(async () => {
      removeOptimistic(id);
      const res = await deleteStat(id);
      if (!res.ok) setError(res.error ?? "error");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t("admin.stats.editor.theStripAtThe")}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {visible.length} {t("admin.stats.editor.stats")}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t("admin.stats.editor.close") : t("admin.stats.editor.addStat")}
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? "admin.stats.editor.somethingWentWrong")}
        </div>
      ) : null}

      {adding ? (
        <form
          ref={addRef}
          action={(fd) => run(() => createStat(fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="rounded-lg border border-border bg-card p-4"
        >
          <StatFields sources={sources} />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
            >
              {pending ? "…" : t("admin.stats.editor.add")}
            </button>
          </div>
        </form>
      ) : null}

      {visible.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t("admin.stats.editor.noStatsYetThe")}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {visible.map((s, i) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-4">
            {editing === s.id ? (
              <form
                action={(fd) => run(() => updateStat(s.id, fd), () => setEditing(null))}
              >
                <StatFields
                  initial={{
                    mode: s.mode,
                    value: s.value,
                    source: s.source,
                    labelKa: s.labelKa,
                    labelEn: s.labelEn,
                    suffix: s.suffix,
                    baseValue: s.baseValue,
                    changeMin: s.changeMin,
                    changeMax: s.changeMax,
                    intervalMinMs: s.intervalMinMs,
                    intervalMaxMs: s.intervalMaxMs,
                  }}
                  sources={sources}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditing(null); setError(null); }}
                    className="h-9 rounded-[8px] border border-border px-4 text-[13px] font-medium"
                  >
                    {t("admin.stats.editor.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
                  >
                    {pending ? "…" : t("admin.stats.editor.save")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
                <div className="font-mono text-2xl font-medium tabular-nums">
                  {s.mode === "LIVE"
                    ? (sources.find((o) => o.key === s.source)?.value ?? "—")
                    : s.mode === "AUTO"
                      ? Math.round(s.autoValue ?? s.baseValue).toLocaleString("en-US")
                      : s.value}
                  {s.suffix}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{s.labelKa}</div>
                  <div className="truncate text-[13px] text-muted">
                    {s.mode === "LIVE"
                      ? t(sources.find((o) => o.key === s.source)?.label ?? { ka: s.source, en: s.source })
                      : s.mode === "AUTO"
                        ? `+${s.changeMin}…${s.changeMax} / ${Math.round(s.intervalMinMs / 1000)}–${Math.round(s.intervalMaxMs / 1000)}${t("admin.stats.editor.s")}`
                        : s.labelEn}
                  </div>
                </div>
                {s.mode === "LIVE" ? (
                  <span className="shrink-0 rounded-full bg-green-surface px-2 py-0.5 text-[11px] text-green">
                    {t("admin.stats.editor.live")}
                  </span>
                ) : null}
                {s.mode === "AUTO" ? (
                  <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
                    {t("admin.stats.editor.automatic")}
                  </span>
                ) : null}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveStat(s.id, "up"))}
                    aria-label={t("admin.stats.editor.moveUp")}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30"
                  >
                    <IconChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={pending || i === stats.length - 1}
                    onClick={() => run(() => moveStat(s.id, "down"))}
                    aria-label={t("admin.stats.editor.moveDown")}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30"
                  >
                    <IconChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => { setEditing(s.id); setError(null); }}
                    aria-label={t("admin.stats.editor.edit")}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40"
                  >
                    <IconPencil size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(s.id)}
                    aria-label={t("admin.stats.editor.delete")}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
