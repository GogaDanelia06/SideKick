"use client";

import { useRef, useState, useTransition } from "react";
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
import { createStat, updateStat, deleteStat, moveStat } from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  all_fields_required: { ka: "შეავსეთ ყველა ველი", en: "Fill in every field" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
  unknown_source: { ka: "აირჩიე მთვლელი", en: "Pick a counter" },
  bad_mode: { ka: "აირჩიე ციფრის ტიპი", en: "Pick how the figure works" },
  value_required: { ka: "ჩაწერე ციფრი", en: "Type a figure" },
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

const MODES: { key: Mode; label: Bilingual; hint: Bilingual }[] = [
  {
    key: "MANUAL",
    label: { ka: "ხელით", en: "By hand" },
    hint: {
      ka: "რასაც ჩაწერ, ის ჩანს. არ იცვლება.",
      en: "Whatever you type is what shows. It never changes.",
    },
  },
  {
    key: "AUTO",
    label: { ka: "ავტომატური ზრდა", en: "Automatic growth" },
    hint: {
      ka: "იწყება საწყისი ციფრიდან და თვითონ იზრდება მითითებულ დიაპაზონებში. ციფრი სერვერზე ინახება, ამიტომ ყველა ვიზიტორი ერთსა და იმავეს ხედავს და გვერდის განახლება მას თავიდან არ იწყებს.",
      en: "Starts at the start value and climbs by itself within the ranges below. The figure is kept on the server, so every visitor sees the same one and a refresh does not restart it.",
    },
  },
  {
    key: "LIVE",
    label: { ka: "ლაივ მთვლელი", en: "Live counter" },
    hint: {
      ka: "ნამდვილი ციფრი ბაზიდან. საიტზე მწვანე წერტილით აღინიშნება.",
      en: "A real figure from the database. Marked with a green dot on the site.",
    },
  },
];

/**
 * One figure in the strip: typed, drifting, or counted.
 *
 * The three modes are tabs rather than a dropdown because they are not variants
 * of one thing — each brings its own fields, and seeing which fields appear is
 * the fastest way to understand what the mode does.
 */
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
          placeholder={t({ ka: "წარწერა (ქართ.)", en: "Label (KA)" })}
          className={INPUT}
        />
        <input
          name="labelEn"
          required
          defaultValue={initial?.labelEn}
          placeholder={t({ ka: "წარწერა (ინგ.)", en: "Label (EN)" })}
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
            placeholder={t({ ka: "ციფრი, მაგ. 1,200+", en: "Figure, e.g. 1,200+" })}
            className={INPUT}
          />
          <input
            name="suffix"
            defaultValue={initial?.suffix}
            placeholder={t({ ka: "სუფიქსი", en: "Suffix" })}
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
            {t({
              ka: `ახლა: ${picked?.value ?? "—"}. ხელით შეცვლა აღარ სჭირდება.`,
              en: `Right now: ${picked?.value ?? "—"}. Nothing to keep up to date.`,
            })}
          </p>
        </>
      ) : null}

      {mode === "AUTO" ? (
        <div className="grid gap-2.5 rounded-[8px] border border-border2 bg-soft p-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className={FIELD_LABEL}>{t({ ka: "საწყისი ციფრი", en: "Start value" })}</span>
              <input
                name="baseValue"
                type="number"
                step="any"
                defaultValue={initial?.baseValue ?? 1000}
                className={SMALL}
              />
            </label>
            <label className="block">
              <span className={FIELD_LABEL}>{t({ ka: "სუფიქსი", en: "Suffix" })}</span>
              <input name="suffix" defaultValue={initial?.suffix} placeholder="₾ / % / +" className={SMALL} />
            </label>
          </div>

          <div>
            <span className={FIELD_LABEL}>
              {t({ ka: "რამდენით გაიზარდოს (დიაპაზონი)", en: "How much it grows (range)" })}
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
              {t({ ka: "რა სიხშირით, წამებში (დიაპაზონი)", en: "How often, in seconds (range)" })}
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

          {/* Saving restarts the figure, and an admin who does not know that
              will change the start value, see nothing, and try again. */}
          <p className="text-[12px] text-amber">
            {t({
              ka: "შენახვისას ციფრი თავიდან იწყებს ზრდას საწყისი ციფრიდან.",
              en: "Saving restarts the figure from its start value.",
            })}
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

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, onDone?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "error");
      else onDone?.();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t({
          ka: "მთავარი გვერდის ქვედა ზოლი. თითოეული ციფრი სამი ტიპიდან ერთია — ხელით ჩაწერილი, ავტომატურად მზარდი, ან ნამდვილი მთვლელი ბაზიდან.",
          en: "The strip at the bottom of the landing page. Each figure is one of three kinds — typed by hand, growing automatically, or a real counter from the database.",
        })}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {stats.length} {t({ ka: "მაჩვენებელი", en: "stats" })}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "დამატება", en: "Add stat" })}
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
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
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </form>
      ) : null}

      {stats.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t({ ka: "ჯერ არცერთი მაჩვენებელი. საიტზე სექცია არ ჩანს.", en: "No stats yet. The section is hidden on the site." })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {stats.map((s, i) => (
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
                    {t({ ka: "გაუქმება", en: "Cancel" })}
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
                  >
                    {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
                {/* The figure the site is showing right now — for a counted or
                    drifting stat that is the whole point of the row. */}
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
                        ? `+${s.changeMin}…${s.changeMax} / ${Math.round(s.intervalMinMs / 1000)}–${Math.round(s.intervalMaxMs / 1000)}${t({ ka: "წმ", en: "s" })}`
                        : s.labelEn}
                  </div>
                </div>
                {s.mode === "LIVE" ? (
                  <span className="shrink-0 rounded-full bg-green-surface px-2 py-0.5 text-[11px] text-green">
                    {t({ ka: "ლაივ", en: "Live" })}
                  </span>
                ) : null}
                {s.mode === "AUTO" ? (
                  <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
                    {t({ ka: "ავტომატური", en: "Automatic" })}
                  </span>
                ) : null}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveStat(s.id, "up"))}
                    aria-label={t({ ka: "აწევა", en: "Move up" })}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30"
                  >
                    <IconChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={pending || i === stats.length - 1}
                    onClick={() => run(() => moveStat(s.id, "down"))}
                    aria-label={t({ ka: "ჩამოწევა", en: "Move down" })}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30"
                  >
                    <IconChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => { setEditing(s.id); setError(null); }}
                    aria-label={t({ ka: "რედაქტირება", en: "Edit" })}
                    className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40"
                  >
                    <IconPencil size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteStat(s.id))}
                    aria-label={t({ ka: "წაშლა", en: "Delete" })}
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
