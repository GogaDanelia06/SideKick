"use client";

import { useState, useTransition } from "react";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { updateSeo } from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-blue";

const LIMITS = { title: 60, description: 160 };

export function SeoEditor({ title, description }: { title: string; description: string }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [t1, setT1] = useState(title);
  const [d1, setD1] = useState(description);

  function save(fd: FormData) {
    setError(false);
    setSaved(false);
    start(async () => {
      const res = await updateSeo(fd);
      if (!res.ok) setError(true);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const counter = (len: number, max: number) => (
    <span className={len > max ? "text-amber" : "text-faint"}>
      {len} / {max}
    </span>
  );

  return (
    <form action={save} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t({ ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t({ ka: "სათაური (title)", en: "Title" })}
          {counter(t1.length, LIMITS.title)}
        </span>
        <input name="title" value={t1} onChange={(e) => setT1(e.target.value)} className={INPUT} />
      </label>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t({ ka: "აღწერა (description)", en: "Description" })}
          {counter(d1.length, LIMITS.description)}
        </span>
        <textarea
          name="description"
          value={d1}
          onChange={(e) => setD1(e.target.value)}
          className={`${INPUT} min-h-[92px]`}
        />
      </label>

      <div className="rounded-[8px] border border-border2 bg-soft p-4">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "გადახედვა", en: "Preview" })}
        </div>
        <div className="truncate text-[15px] text-blue">{t1 || t({ ka: "სათაური", en: "Title" })}</div>
        <div className="text-[12px] text-green">https://sidekick.ge</div>
        <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{d1}</div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-green">
            <IconCheck size={15} /> {t({ ka: "შენახულია", en: "Saved" })}
          </span>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[8px] bg-ink px-5 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
        </button>
      </div>
    </form>
  );
}
