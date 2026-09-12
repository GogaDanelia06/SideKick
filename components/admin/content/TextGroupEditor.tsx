"use client";

import { useState, useTransition } from "react";
import { IconAlertTriangle, IconCheck, IconExternalLink } from "@tabler/icons-react";
import { saveTextGroup } from "@/lib/admin/actions/texts";
import { MediaField } from "@/components/admin/ui/MediaField";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { TextGroup } from "@/lib/site/textKeys";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-blue";

type Values = Record<string, { ka: string; en: string }>;

/** Generic editor rendered from the field registry — every text section on the
 *  public site uses this one screen. */
export function TextGroupEditor({ group, values }: { group: TextGroup; values: Values }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  function save(fd: FormData) {
    setError(false);
    setSaved(false);
    start(async () => {
      const res = await saveTextGroup(group.slug, fd);
      if (!res.ok) setError(true);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form action={save} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[13px] text-muted">
        <IconExternalLink size={15} className="shrink-0" />
        {t({ ka: "ჩანს აქ:", en: "Appears on:" })} <strong className="text-ink">{t(group.page)}</strong>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t({ ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
        {group.fields.map((f) => {
          const v = values[f.key] ?? { ka: "", en: "" };
          const Field = f.kind === "long" ? "textarea" : "input";
          const type = f.kind === "email" ? "email" : f.kind === "tel" ? "tel" : "text";

          return (
            <div key={f.key}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[13px] font-medium">{t(f.label)}</span>
                {f.hint && f.kind !== "media" ? (
                  <span className="text-[11px] text-faint">{t(f.hint)}</span>
                ) : null}
              </div>

              {f.kind === "media" ? (
                <MediaField name={f.key} initialUrl={v.ka} imagesOnly note={f.hint} />
              ) : f.singleLang ? (
                <Field
                  name={f.key}
                  type={type}
                  defaultValue={v.ka}
                  className={`${INPUT}${f.kind === "long" ? " min-h-[110px]" : ""}`}
                />
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
                      ქართული
                    </span>
                    <Field
                      name={f.key}
                      type={type}
                      defaultValue={v.ka}
                      className={`${INPUT}${f.kind === "long" ? " min-h-[150px]" : ""}`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
                      English
                    </span>
                    <Field
                      name={`${f.key}__en`}
                      type={type}
                      defaultValue={v.en}
                      className={`${INPUT}${f.kind === "long" ? " min-h-[150px]" : ""}`}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
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
