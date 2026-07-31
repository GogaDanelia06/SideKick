"use client";

import { useRef, useState, useTransition } from "react";
import type { Tutorial } from "@prisma/client";
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
  createTutorial,
  updateTutorial,
  deleteTutorial,
  moveTutorial,
  toggleTutorialPublished,
} from "@/lib/admin/actions";
import { youtubeThumbnail } from "@/lib/dashboard/tutorials";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const AREA =
  "min-h-[64px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  title_required: { ka: "ქართული სათაური სავალდებულოა", en: "Georgian title is required" },
  bad_url: { ka: "მიუთითეთ სწორი YouTube ბმული", en: "Enter a valid YouTube link" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
};

function Fields({ initial }: { initial?: Tutorial }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2.5">
      <input
        name="youtubeUrl"
        required
        defaultValue={initial?.youtubeUrl}
        placeholder="https://www.youtube.com/watch?v=…"
        className={INPUT}
      />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input name="titleKa" required defaultValue={initial?.titleKa} placeholder={t({ ka: "სათაური (ქართ.) *", en: "Title (KA) *" })} className={INPUT} />
        <input name="titleEn" defaultValue={initial?.titleEn} placeholder={t({ ka: "სათაური (ინგ.)", en: "Title (EN)" })} className={INPUT} />
        <textarea name="descKa" defaultValue={initial?.descKa} placeholder={t({ ka: "აღწერა (ქართ.)", en: "Description (KA)" })} className={AREA} />
        <textarea name="descEn" defaultValue={initial?.descEn} placeholder={t({ ka: "აღწერა (ინგ.)", en: "Description (EN)" })} className={AREA} />
        <input name="categoryKa" defaultValue={initial?.categoryKa} placeholder={t({ ka: "კატეგორია (ქართ.)", en: "Category (KA)" })} className={INPUT} />
        <input name="categoryEn" defaultValue={initial?.categoryEn} placeholder={t({ ka: "კატეგორია (ინგ.)", en: "Category (EN)" })} className={INPUT} />
      </div>
    </div>
  );
}

/** The how-to videos every tenant sees under "Tutorials" in their dashboard. */
export function TutorialsEditor({ tutorials }: { tutorials: Tutorial[] }) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted">
            {tutorials.length} {t({ ka: "ვიდეო", en: "videos" })}
          </div>
          <p className="mt-0.5 text-[12px] text-faint">
            {t({
              ka: "ეს ვიდეოები ყველა ბიზნესს უჩანს დაშბორდში, „ვიდეო ინსტრუქციების“ ჩანართში.",
              en: "Every business sees these under Tutorials in their dashboard.",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "ვიდეოს დამატება", en: "Add video" })}
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
          action={(fd) => run(() => createTutorial(fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="rounded-lg border border-border bg-card p-4"
        >
          <Fields />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </form>
      ) : null}

      {tutorials.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t({ ka: "ჯერ არცერთი ვიდეო.", en: "No videos yet." })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {tutorials.map((v, i) => {
          const thumb = youtubeThumbnail(v.youtubeUrl);
          return (
            <div key={v.id} className="rounded-lg border border-border bg-card p-4">
              {editing === v.id ? (
                <form action={(fd) => run(() => updateTutorial(v.id, fd), () => setEditing(null))}>
                  <Fields initial={v} />
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
                  {/* Dropped on the narrowest screens so the title keeps room
                      next to the five action buttons. */}
                  <span className="hidden h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-soft sm:grid">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="size-full object-cover" loading="lazy" />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className={v.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                      {v.titleKa}
                    </div>
                    {v.descKa ? (
                      <div className="mt-0.5 truncate text-[13px] text-muted">{v.descKa}</div>
                    ) : null}
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-[11px] text-faint hover:text-ink">
                      {v.youtubeUrl}
                    </a>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveTutorial(v.id, "up"))} aria-label={t({ ka: "აწევა", en: "Move up" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronUp size={16} />
                    </button>
                    <button type="button" disabled={pending || i === tutorials.length - 1} onClick={() => run(() => moveTutorial(v.id, "down"))} aria-label={t({ ka: "ჩამოწევა", en: "Move down" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronDown size={16} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => toggleTutorialPublished(v.id, !v.published))} aria-label={t({ ka: "გამოქვეყნება", en: "Toggle publish" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      {v.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                    </button>
                    <button type="button" disabled={pending} onClick={() => { setEditing(v.id); setError(null); }} aria-label={t({ ka: "რედაქტირება", en: "Edit" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      <IconPencil size={15} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => deleteTutorial(v.id))} aria-label={t({ ka: "წაშლა", en: "Delete" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40">
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
