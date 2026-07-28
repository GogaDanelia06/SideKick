"use client";

import { useRef, useState, useTransition } from "react";
import type { LegalSection } from "@prisma/client";
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
  createLegalSection,
  updateLegalSection,
  deleteLegalSection,
  moveLegalSection,
  toggleLegalPublished,
} from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[11px] uppercase tracking-wide text-faint";

const ERRORS: Record<string, Bilingual> = {
  heading_required: { ka: "სათაური ორივე ენაზე სავალდებულოა", en: "Heading is required in both languages" },
  unknown_doc: { ka: "დოკუმენტი ვერ მოიძებნა", en: "Unknown document" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
};

type Fields = Pick<
  LegalSection,
  "headingKa" | "headingEn" | "bodyKa" | "bodyEn" | "bulletsKa" | "bulletsEn"
>;

function SectionFields({ initial }: { initial?: Fields }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t({ ka: "სათაური — ქართული", en: "Heading — Georgian" })}</span>
          <input name="headingKa" required defaultValue={initial?.headingKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t({ ka: "სათაური — English", en: "Heading — English" })}</span>
          <input name="headingEn" required defaultValue={initial?.headingEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t({ ka: "ტექსტი — ქართული", en: "Body — Georgian" })}</span>
          <textarea
            name="bodyKa"
            defaultValue={initial?.bodyKa}
            placeholder={t({ ka: "აბზაცები ცარიელი ხაზით გაყავი", en: "Separate paragraphs with a blank line" })}
            className={`${INPUT} min-h-[130px]`}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t({ ka: "ტექსტი — English", en: "Body — English" })}</span>
          <textarea name="bodyEn" defaultValue={initial?.bodyEn} className={`${INPUT} min-h-[130px]`} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t({ ka: "ჩამონათვალი — ქართული", en: "Bullets — Georgian" })}</span>
          <textarea
            name="bulletsKa"
            defaultValue={initial?.bulletsKa}
            placeholder={t({ ka: "თითო პუნქტი ახალ ხაზზე (არასავალდებულო)", en: "One item per line (optional)" })}
            className={`${INPUT} min-h-[90px]`}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t({ ka: "ჩამონათვალი — English", en: "Bullets — English" })}</span>
          <textarea name="bulletsEn" defaultValue={initial?.bulletsEn} className={`${INPUT} min-h-[90px]`} />
        </label>
      </div>
    </div>
  );
}

export function LegalEditor({ doc, sections }: { doc: string; sections: LegalSection[] }) {
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
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {sections.length} {t({ ka: "სექცია", en: "sections" })}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "სექციის დამატება", en: "Add section" })}
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
          action={(fd) =>
            run(() => createLegalSection(doc, fd), () => { addRef.current?.reset(); setAdding(false); })
          }
          className="rounded-lg border border-border bg-card p-4"
        >
          <SectionFields />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {sections.map((s, i) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-4">
            {editing === s.id ? (
              <form action={(fd) => run(() => updateLegalSection(s.id, fd), () => setEditing(null))}>
                <SectionFields initial={s} />
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
                <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-[12px] text-faint">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={s.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                    {s.headingKa}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{s.bodyKa}</div>
                  {s.bulletsKa ? (
                    <div className="mt-1 text-[12px] text-faint">
                      • {s.bulletsKa.split("\n").filter(Boolean).length}{" "}
                      {t({ ka: "პუნქტი", en: "bullets" })}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveLegalSection(s.id, "up"))} aria-label={t({ ka: "აწევა", en: "Move up" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                    <IconChevronUp size={16} />
                  </button>
                  <button type="button" disabled={pending || i === sections.length - 1} onClick={() => run(() => moveLegalSection(s.id, "down"))} aria-label={t({ ka: "ჩამოწევა", en: "Move down" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                    <IconChevronDown size={16} />
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => toggleLegalPublished(s.id, !s.published))} aria-label={t({ ka: "გამოქვეყნება", en: "Toggle publish" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                    {s.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                  </button>
                  <button type="button" disabled={pending} onClick={() => { setEditing(s.id); setError(null); }} aria-label={t({ ka: "რედაქტირება", en: "Edit" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                    <IconPencil size={15} />
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => deleteLegalSection(s.id))} aria-label={t({ ka: "წაშლა", en: "Delete" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40">
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
