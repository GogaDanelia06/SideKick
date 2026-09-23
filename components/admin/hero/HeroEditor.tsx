"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { HeroSlide, HeroSlideStat } from "@prisma/client";
import {
  IconAlertTriangle,
  IconCheck,
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
  createSlide,
  updateSlide,
  deleteSlide,
  moveSlide,
  toggleSlidePublished,
  updateHeroInterval,
} from "@/lib/admin/actions/hero";
import { MediaField } from "@/components/admin/ui/MediaField";
import { SlideStats } from "./SlideStats";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[11px] uppercase tracking-wide text-faint";

const ERRORS: Record<string, Text> = {
  title_required: "admin.hero.editor.titleIsRequiredIn",
  bad_interval: "admin.hero.editor.secondsMustBeBetween",
  not_found: "admin.hero.editor.notFound",
};

export type SlideWithStats = HeroSlide & { stats: HeroSlideStat[] };

function SlideFields({ initial }: { initial?: SlideWithStats }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <MediaField
        name="mediaUrl"
        typeName="mediaType"
        initialUrl={initial?.mediaUrl}
        initialType={initial?.mediaType}
      />

      <label className="block">
        <span className={LABEL}>
          {t("admin.hero.editor.builtInAnimationShown")}
        </span>
        <select name="mock" defaultValue={initial?.mock ?? ""} className={INPUT}>
          <option value="">{t("admin.hero.editor.none")}</option>
          <option value="chat">{t("admin.hero.editor.chat")}</option>
          <option value="dashboard">{t("admin.hero.editor.dashboard")}</option>
          <option value="tester">{t("admin.hero.editor.tester")}</option>
        </select>
        <p className="mt-1.5 text-[12px] text-faint">
          {t("admin.hero.editor.theRightHandPanel")}
        </p>
      </label>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.badgeGeorgian")}</span>
          <input name="badgeKa" defaultValue={initial?.badgeKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.badgeEnglish")}</span>
          <input name="badgeEn" defaultValue={initial?.badgeEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.titleGeorgian")}</span>
          <input name="titleKa" required defaultValue={initial?.titleKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.titleEnglish")}</span>
          <input name="titleEn" required defaultValue={initial?.titleEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.textGeorgian")}</span>
          <textarea name="textKa" defaultValue={initial?.textKa} className={`${INPUT} min-h-[100px]`} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.textEnglish")}</span>
          <textarea name="textEn" defaultValue={initial?.textEn} className={`${INPUT} min-h-[100px]`} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonGeorgian")}</span>
          <input name="ctaLabelKa" defaultValue={initial?.ctaLabelKa} placeholder={t("admin.hero.editor.learnMore")} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonEnglish")}</span>
          <input name="ctaLabelEn" defaultValue={initial?.ctaLabelEn} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonUrl")}</span>
          <input name="ctaUrl" defaultValue={initial?.ctaUrl ?? "/pricing"} placeholder="/pricing" className={INPUT} />
        </label>
      </div>
    </div>
  );
}

export function HeroEditor({
  slides,
  intervalSeconds,
  sources,
}: {
  slides: SlideWithStats[];
  intervalSeconds: number;
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedInterval, setSavedInterval] = useState(false);
  const addRef = useRef<HTMLFormElement>(null);

  // Optimistic removal; React restores the row if the server refuses.
  const [visible, removeOptimistic] = useOptimistic(
    slides,
    (rows: SlideWithStats[], id: string) => rows.filter((r) => r.id !== id),
  );

  function remove(id: string) {
    setError(null);
    start(async () => {
      removeOptimistic(id);
      const res = await deleteSlide(id);
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
      <form
        action={(fd) =>
          run(() => updateHeroInterval(fd), () => {
            setSavedInterval(true);
            setTimeout(() => setSavedInterval(false), 2500);
          })
        }
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <label className="block">
          <span className={LABEL}>
            {t("admin.hero.editor.autoAdvanceSeconds")}
          </span>
          <input
            name="seconds"
            type="number"
            min={1}
            max={60}
            defaultValue={intervalSeconds}
            className={`${INPUT} w-32`}
          />
        </label>
        <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
          {pending ? "…" : t("admin.hero.editor.save")}
        </button>
        {savedInterval ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-green">
            <IconCheck size={15} /> {t("admin.hero.editor.saved")}
          </span>
        ) : null}
      </form>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {slides.length} {t("admin.hero.editor.slides")}
        </span>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setError(null); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t("admin.hero.editor.close") : t("admin.hero.editor.addSlide")}
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? "admin.hero.editor.somethingWentWrong")}
        </div>
      ) : null}

      {adding ? (
        <form
          ref={addRef}
          action={(fd) => run(() => createSlide(fd), () => { addRef.current?.reset(); setAdding(false); })}
          className="rounded-lg border border-border bg-card p-4"
        >
          <SlideFields />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t("admin.hero.editor.add")}
            </button>
          </div>
        </form>
      ) : null}

      {slides.length === 0 && !adding ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">
          {t("admin.hero.editor.noSlidesYetThe")}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {visible.map((s, i) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-4">
            {editing === s.id ? (
              <form action={(fd) => run(() => updateSlide(s.id, fd), () => setEditing(null))}>
                <SlideFields initial={s} />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => { setEditing(null); setError(null); }} className="h-9 rounded-[8px] border border-border px-4 text-[13px] font-medium">
                    {t("admin.hero.editor.cancel")}
                  </button>
                  <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
                    {pending ? "…" : t("admin.hero.editor.save")}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-[12px] text-faint">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={s.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                      {s.titleKa}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-muted">{s.textKa}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-faint">
                      <span>{s.mediaUrl ? t("admin.hero.editor.media") : s.mock || t("admin.hero.editor.noMedia")}</span>
                      <span>·</span>
                      <span>{s.ctaUrl}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveSlide(s.id, "up"))} aria-label={t("admin.hero.editor.moveUp")} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronUp size={16} />
                    </button>
                    <button type="button" disabled={pending || i === slides.length - 1} onClick={() => run(() => moveSlide(s.id, "down"))} aria-label={t("admin.hero.editor.moveDown")} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-30">
                      <IconChevronDown size={16} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => toggleSlidePublished(s.id, !s.published))} aria-label={t("admin.hero.editor.togglePublish")} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      {s.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                    </button>
                    <button type="button" disabled={pending} onClick={() => { setEditing(s.id); setError(null); }} aria-label={t("admin.hero.editor.edit")} className="grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40">
                      <IconPencil size={15} />
                    </button>
                    <button type="button" disabled={pending} onClick={() => remove(s.id)} aria-label={t("admin.hero.editor.delete")} className="grid size-8 place-items-center rounded-[7px] border border-border text-red hover:border-red disabled:opacity-40">
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
                <SlideStats slideId={s.id} stats={s.stats} sources={sources} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
