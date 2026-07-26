"use client";

import { useRef, useState, useTransition } from "react";
import type { Video } from "@prisma/client";
import {
  IconAlertTriangle,
  IconPlayerPlayFilled,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { createVideo, deleteVideo } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  forbidden: { ka: "ამის უფლება არ გაქვთ", en: "You don't have permission for this" },
  title_required: { ka: "სათაური სავალდებულოა", en: "Title is required" },
  bad_url: { ka: "მიუთითეთ სწორი YouTube ბმული", en: "Enter a valid YouTube link" },
};

function thumbnail(url: string): string | null {
  try {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

export function VideosView({
  videos,
  canManage,
}: {
  videos: Video[];
  canManage: boolean;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function submit(fd: FormData) {
    setError(null);
    start(async () => {
      const res = await createVideo(fd);
      if (!res.ok) setError(res.error);
      else {
        formRef.current?.reset();
        setAdding(false);
      }
    });
  }

  function remove(id: string) {
    setError(null);
    start(async () => {
      const res = await deleteVideo(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted">
          {videos.length} {t({ ka: "ვიდეო", en: "videos" })}
        </span>
        {canManage ? (
          <button
            type="button"
            onClick={() => { setAdding((v) => !v); setError(null); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white"
          >
            {adding ? <IconX size={16} /> : <IconPlus size={16} />}
            {adding ? t({ ka: "დახურვა", en: "Close" }) : t({ ka: "ვიდეოს დამატება", en: "Add video" })}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}

      {adding ? (
        <Panel className="p-4">
          <form ref={formRef} action={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto]">
            <input name="title" required placeholder={t({ ka: "სათაური *", en: "Title *" })} className={INPUT} />
            <input name="youtubeUrl" required placeholder="https://youtube.com/watch?v=..." className={INPUT} />
            <input name="category" placeholder={t({ ka: "კატეგორია", en: "Category" })} className={INPUT} />
            <button
              type="submit"
              disabled={pending}
              className="h-10 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
            >
              {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
            </button>
          </form>
        </Panel>
      ) : null}

      {videos.length === 0 ? (
        <Panel className="px-6 py-12 text-center text-sm text-muted">
          {t({ ka: "ვიდეოები ჯერ არ არის", en: "No tutorials yet" })}
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const thumb = thumbnail(v.youtubeUrl);
            return (
              <div
                key={v.id}
                className="group relative overflow-hidden rounded-[14px] border border-border bg-surface transition-colors hover:border-ai"
              >
                {canManage ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(v.id)}
                    aria-label={t({ ka: "წაშლა", en: "Delete" })}
                    className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-[8px] border border-border bg-surface text-red opacity-0 transition-opacity hover:border-red focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
                  >
                    <IconTrash size={15} />
                  </button>
                ) : null}

                <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative grid aspect-video place-items-center overflow-hidden bg-soft">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                    ) : null}
                    <span className="relative grid size-12 place-items-center rounded-full bg-ai text-white transition-transform group-hover:scale-110">
                      <IconPlayerPlayFilled size={22} />
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium">{v.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      {v.category ? (
                        <span className="rounded-full border border-border bg-soft px-2 py-0.5">{v.category}</span>
                      ) : null}
                      <span>{t({ ka: "ნახე YouTube-ზე", en: "Watch on YouTube" })}</span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
