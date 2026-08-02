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
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  all_fields_required: { ka: "შეავსეთ ყველა ველი", en: "Fill in every field" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
  unknown_source: { ka: "უცნობი წყარო", en: "Unknown source" },
  value_or_source_required: {
    ka: "ჩაწერე ციფრი ან აირჩიე ავტომატური წყარო",
    en: "Type a figure or pick an automatic source",
  },
};

type Fields = { value: string; source: string; labelKa: string; labelEn: string };

/**
 * Counted or typed, never both.
 *
 * Picking a source disables the figure box rather than hiding it, so it stays
 * obvious that the number is now coming from somewhere else.
 */
function StatFields({ initial, sources }: { initial?: Fields; sources: StatSourceOption[] }) {
  const { t } = useLanguage();
  const [source, setSource] = useState(initial?.source ?? "");
  const auto = source !== "";

  return (
    <div className="grid gap-2.5">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-muted">
          {t({ ka: "საიდან მოდის ციფრი", en: "Where the figure comes from" })}
        </span>
        <select
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={INPUT}
        >
          <option value="">{t({ ka: "ხელით ჩაწერილი", en: "Typed by hand" })}</option>
          {sources.map((s) => (
            <option key={s.key} value={s.key}>
              {t(s.label)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-2.5 sm:grid-cols-[140px_1fr_1fr]">
        <input
          name="value"
          required={!auto}
          disabled={auto}
          defaultValue={initial?.value}
          placeholder={auto ? t({ ka: "ავტომატური", en: "Automatic" }) : t({ ka: "ციფრი", en: "Figure" })}
          className={`${INPUT} disabled:opacity-50`}
        />
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

      {auto ? (
        <p className="text-[12px] text-green">
          {t({
            ka: "ციფრი ბაზიდან წაიკითხება ყოველ ჯერზე — ხელით შეცვლა აღარ სჭირდება.",
            en: "Read from the database on every visit — nothing to keep up to date.",
          })}
        </p>
      ) : null}
    </div>
  );
}

export type StatSourceOption = { key: string; label: Bilingual };

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
      {/* These are fixed figures. The ones that tick upward on their own are a
          different thing entirely, and this is where people look for them. */}
      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t({
          ka: "ეს არის სტატიკური ციფრების ზოლი — რასაც ჩაწერ, ის ჩანს. ცოცხალი, თავისით მზარდი ციფრები „მთავარი კარუსელის“ სექციაშია, სლაიდის შიგნით.",
          en: "A static strip — whatever you type is what shows. The figures that climb on their own live under “Hero carousel”, inside a slide.",
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
                  initial={{ value: s.value, source: s.source, labelKa: s.labelKa, labelEn: s.labelEn }}
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
                <div className="font-mono text-2xl font-medium">
                  {s.source ? <span className="text-[15px] text-green">auto</span> : s.value}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{s.labelKa}</div>
                  <div className="truncate text-[13px] text-muted">
                    {s.source
                      ? t(sources.find((o) => o.key === s.source)?.label ?? { ka: s.source, en: s.source })
                      : s.labelEn}
                  </div>
                </div>
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
