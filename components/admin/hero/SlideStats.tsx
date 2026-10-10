"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { HeroSlideStat } from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import { createSlideStat, updateSlideStat, deleteSlideStat } from "@/lib/admin/actions/heroStats";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { SlideStatFields } from "./SlideStatFields";
import { SlideStatRow } from "./SlideStatRow";

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
          <SlideStatFields sources={sources} />
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={pending} className="h-7 rounded-[6px] bg-ink px-3 text-[12px] font-medium text-canvas disabled:opacity-60">
              {pending ? "…" : t("admin.hero.slideStats.add")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {visible.map((s) => (
          <div key={s.id} className="rounded-[8px] border border-border bg-card p-2.5">
            {editing === s.id ? (
              <form action={(fd) => run(() => updateSlideStat(s.id, fd), () => setEditing(null))}>
                <SlideStatFields initial={s} sources={sources} />
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
              <SlideStatRow stat={s} sources={sources} pending={pending} onEdit={() => setEditing(s.id)} onRemove={() => remove(s.id)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
