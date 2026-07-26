"use client";

import { useRef, useState, useTransition } from "react";
import type { SiteFaq } from "@prisma/client";
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
  createFaq,
  updateFaq,
  deleteFaq,
  moveFaq,
  toggleFaqPublished,
} from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const AREA =
  "min-h-[76px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  all_fields_required: { ka: "შეავსეთ ოთხივე ველი", en: "Fill in all four fields" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
};

type Fields = Pick<SiteFaq, "questionKa" | "questionEn" | "answerKa" | "answerEn">;

function FaqFields({ initial }: { initial?: Fields }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <input name="questionKa" required defaultValue={initial?.questionKa} placeholder={t({ ka: "კითხვა (ქართ.)", en: "Question (KA)" })} className={INPUT} />
      <input name="questionEn" required defaultValue={initial?.questionEn} placeholder={t({ ka: "კითხვა (ინგ.)", en: "Question (EN)" })} className={INPUT} />
      <textarea name="answerKa" required defaultValue={initial?.answerKa} placeholder={t({ ka: "პასუხი (ქართ.)", en: "Answer (KA)" })} className={AREA} />
      <textarea name="answerEn" required defaultValue={initial?.answerEn} placeholder={t({ ka: "პასუხი (ინგ.)", en: "Answer (EN)" })} className={AREA} />
    </div>
  );
}

export function FaqEditor({ faqs }: { faqs: SiteFaq[] }) {
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
          {faqs.length} {t({ ka: "კითხვა", en: "questions" })}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "დამატება", en: "Add question" })}
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
          action={(fd) => run(() => createFaq(fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="rounded-lg border border-border bg-card p-4"
        >
          <FaqFields />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </form>
      ) : null}

      {faqs.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t({ ka: "ჯერ არცერთი კითხვა.", en: "No questions yet." })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {faqs.map((f, i) => (
          <div key={f.id} className="rounded-lg border border-border bg-card p-4">
            {editing === f.id ? (
              <form action={(fd) => run(() => updateFaq(f.id, fd), () => setEditing(null))}>
                <FaqFields initial={f} />
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
                <div className="min-w-0 flex-1">
                  <div className={f.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                    {f.questionKa}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted">{f.answerKa}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveFaq(f.id, "up"))} aria-label={t({ ka: "აწევა", en: "Move up" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                    <IconChevronUp size={16} />
                  </button>
                  <button type="button" disabled={pending || i === faqs.length - 1} onClick={() => run(() => moveFaq(f.id, "down"))} aria-label={t({ ka: "ჩამოწევა", en: "Move down" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                    <IconChevronDown size={16} />
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => toggleFaqPublished(f.id, !f.published))} aria-label={t({ ka: "გამოქვეყნება", en: "Toggle publish" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                    {f.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                  </button>
                  <button type="button" disabled={pending} onClick={() => { setEditing(f.id); setError(null); }} aria-label={t({ ka: "რედაქტირება", en: "Edit" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                    <IconPencil size={15} />
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => deleteFaq(f.id))} aria-label={t({ ka: "წაშლა", en: "Delete" })} className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40">
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
