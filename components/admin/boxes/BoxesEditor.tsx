"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  createBox,
  updateBox,
  deleteBox,
  moveBox,
  toggleBoxPublished,
  type BoxKind,
} from "@/lib/admin/actions";
import { ICON_NAMES, resolveIcon } from "@/lib/content/icons";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[11px] uppercase tracking-wide text-faint";

const ERRORS: Record<string, Bilingual> = {
  title_required: { ka: "სათაური ორივე ენაზე სავალდებულოა", en: "Title is required in both languages" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
};

/** Shape both tables share, once the differing body column is normalised. */
export type BoxItem = {
  id: string;
  order: number;
  published: boolean;
  icon: string;
  titleKa: string;
  titleEn: string;
  bodyKa: string;
  bodyEn: string;
};

/** Visual grid picker — the admin sees the icon, not a name to memorise. */
function IconPicker({ initial }: { initial?: string }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(initial ?? "IconSparkles");

  return (
    <div>
      <span className={LABEL}>{t({ ka: "აიკონი", en: "Icon" })}</span>
      <input type="hidden" name="icon" value={selected} />
      <div className="flex flex-wrap gap-1.5 rounded-[8px] border border-input bg-canvas p-2">
        {ICON_NAMES.map((name) => {
          const Ico = resolveIcon(name);
          const on = selected === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-pressed={on}
              onClick={() => setSelected(name)}
              className={clsx(
                "grid size-9 place-items-center rounded-[7px] border transition-colors",
                on ? "border-blue bg-blue-surface text-blue" : "border-border text-muted hover:text-ink",
              )}
            >
              <Ico size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BoxFields({ initial }: { initial?: BoxItem }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <IconPicker initial={initial?.icon} />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t({ ka: "სათაური — ქართული", en: "Title — Georgian" })}</span>
          <input name="titleKa" required defaultValue={initial?.titleKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t({ ka: "სათაური — English", en: "Title — English" })}</span>
          <input name="titleEn" required defaultValue={initial?.titleEn} className={INPUT} />
        </label>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t({ ka: "აღწერა — ქართული", en: "Description — Georgian" })}</span>
          <textarea name="bodyKa" defaultValue={initial?.bodyKa} className={`${INPUT} min-h-[100px]`} />
        </label>
        <label className="block">
          <span className={LABEL}>{t({ ka: "აღწერა — English", en: "Description — English" })}</span>
          <textarea name="bodyEn" defaultValue={initial?.bodyEn} className={`${INPUT} min-h-[100px]`} />
        </label>
      </div>
    </div>
  );
}

export function BoxesEditor({ kind, items }: { kind: BoxKind; items: BoxItem[] }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addRef = useRef<HTMLFormElement>(null);

  // The row goes the moment it is clicked rather than after the round trip
  // and the re-render that follows it. React restores it if the server refuses.
  const [visible, removeOptimistic] = useOptimistic(
    items,
    (rows: BoxItem[], id: string) => rows.filter((r) => r.id !== id),
  );

  function remove(id: string) {
    setError(null);
    start(async () => {
      removeOptimistic(id);
      const res = await deleteBox(kind, id);
      if (!res.ok) setError(res.error ?? "error");
    });
  }

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
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {items.length} {t({ ka: "ბოქსი", en: "boxes" })}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "ბოქსის დამატება", en: "Add box" })}
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
          action={(fd) => run(() => createBox(kind, fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="rounded-lg border border-border bg-card p-4"
        >
          <BoxFields />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </form>
      ) : null}

      {items.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t({ ka: "ჯერ არცერთი ბოქსი.", en: "No boxes yet." })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {visible.map((b, i) => {
          const Ico = resolveIcon(b.icon);
          return (
            <div key={b.id} className="rounded-lg border border-border bg-card p-4">
              {editing === b.id ? (
                <form action={(fd) => run(() => updateBox(kind, b.id, fd), () => setEditing(null))}>
                  <BoxFields initial={b} />
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditing(null); setError(null); }} className="h-9 rounded-[8px] border border-border px-4 text-[13px] font-medium">
                      {t({ ka: "გაუქმება", en: "Cancel" })}
                    </button>
                    <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
                      {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
                    <Ico size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={b.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                      {b.titleKa}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{b.bodyKa}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveBox(kind, b.id, "up"))} aria-label={t({ ka: "აწევა", en: "Move up" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronUp size={16} />
                    </button>
                    <button type="button" disabled={pending || i === items.length - 1} onClick={() => run(() => moveBox(kind, b.id, "down"))} aria-label={t({ ka: "ჩამოწევა", en: "Move down" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronDown size={16} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => toggleBoxPublished(kind, b.id, !b.published))} aria-label={t({ ka: "გამოქვეყნება", en: "Toggle publish" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      {b.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                    </button>
                    <button type="button" disabled={pending} onClick={() => { setEditing(b.id); setError(null); }} aria-label={t({ ka: "რედაქტირება", en: "Edit" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      <IconPencil size={15} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => remove(b.id)} aria-label={t({ ka: "წაშლა", en: "Delete" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40">
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
