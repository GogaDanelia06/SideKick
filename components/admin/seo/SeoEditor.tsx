"use client";

import { useState, useTransition } from "react";
import type { PageSeo } from "@prisma/client";
import { IconAlertTriangle, IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { updateSeo } from "@/lib/admin/actions/seo";
import { MediaField } from "@/components/admin/ui/MediaField";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-blue";

/** Google truncates around these lengths; longer is a warning, not an error. */
const LIMITS = { title: 60, description: 160 };

const ERRORS: Record<string, Text> = {
  bad_canonical: "admin.seo.editor.canonicalMustBeA",
  unknown_page: "admin.seo.editor.unknownPage",
};

export type SeoValues = Pick<
  PageSeo,
  "title" | "description" | "canonical" | "indexable" | "ogTitle" | "ogDescription" | "ogImageUrl"
>;

/** SEO for one public page; blank fields fall back to the defaults shown as placeholders. */
export function SeoEditor({
  path,
  values,
  defaults,
}: {
  path: string;
  values: SeoValues;
  defaults: { title: string; description: string; siteUrl: string };
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(values.title);
  const [description, setDescription] = useState(values.description);
  const [indexable, setIndexable] = useState(values.indexable);

  function save(fd: FormData) {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updateSeo(path, fd);
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const counter = (len: number, max: number) =>
    len === 0 ? (
      <span className="text-faint">{t("admin.seo.editor.default")}</span>
    ) : (
      <span className={len > max ? "text-amber" : "text-faint"}>
        {len} / {max}
      </span>
    );

  const shownTitle = title || defaults.title;
  const shownDesc = description || defaults.description;

  return (
    <form action={save} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-muted">
          {t("admin.seo.editor.page")} <span className="font-mono text-ink">{path}</span>
        </div>
        <p className="text-[11px] text-faint">
          {t("admin.seo.editor.aBlankFieldMeans")}
        </p>
      </div>

      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t("admin.seo.editor.thisSectionOnlyChanges")}
      </p>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? "admin.seo.editor.somethingWentWrong")}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t("admin.seo.editor.title")}
          {counter(title.length, LIMITS.title)}
        </span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={defaults.title}
          className={INPUT}
        />
        <span className="mt-1 block text-[11px] text-faint">
          {t("admin.seo.editor.thisAppearsInGoogle")}
        </span>
      </label>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t("admin.seo.editor.description")}
          {counter(description.length, LIMITS.description)}
        </span>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={defaults.description}
          className={`${INPUT} min-h-[92px]`}
        />
      </label>

      <div className="select-none rounded-[8px] border border-dashed border-border2 bg-soft p-4 opacity-90">
        <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-faint">
          <span>{t("admin.seo.editor.googlePreview")}</span>
          <span className="normal-case tracking-normal">
            {t("admin.seo.editor.previewOnly")}
          </span>
        </div>
        <div className="truncate text-[15px] text-blue">{shownTitle}</div>
        <div className="text-[12px] text-green">
          {defaults.siteUrl}
          {path === "/" ? "" : path}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{shownDesc}</div>
        <p className="mt-2.5 border-t border-border2 pt-2 text-[11px] text-faint">
          {t("admin.seo.editor.thisIsWhatGoogle")}
        </p>
      </div>

      <div className="grid gap-4 border-t border-border2 pt-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.canonicalUrl")}</span>
          <input
            name="canonical"
            defaultValue={values.canonical}
            placeholder={path}
            className={INPUT}
          />
          <span className="mt-1 block text-[11px] text-faint">
            {t("admin.seo.editor.blankThePageS")}
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted">
            {t("admin.seo.editor.slugUrl")}
          </span>
          <input value={path} readOnly disabled className={`${INPUT} opacity-60`} />
          <span className="mt-1 block text-[11px] text-faint">
            {t("admin.seo.editor.theAddressIsDefined")}
          </span>
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-[12px] font-medium text-muted">
          {t("admin.seo.editor.indexing")}
        </span>
        <input type="hidden" name="indexable" value={indexable ? "1" : "0"} />
        <button
          type="button"
          onClick={() => setIndexable((v) => !v)}
          className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium ${
            indexable
              ? "border-green bg-green-surface text-green"
              : "border-amber bg-soft text-amber"
          }`}
        >
          {indexable ? <IconEye size={16} /> : <IconEyeOff size={16} />}
          {indexable
            ? t("admin.seo.editor.indexVisibleInSearch")
            : t("admin.seo.editor.noindexHiddenFromSearch")}
        </button>
      </div>

      <div className="grid gap-4 border-t border-border2 pt-5">
        <div className="text-[11px] uppercase tracking-wide text-faint">
          {t("admin.seo.editor.socialSharingOpenGraph")}
        </div>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.ogTitle")}</span>
          <input
            name="ogTitle"
            defaultValue={values.ogTitle}
            placeholder={shownTitle}
            className={INPUT}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.ogDescription")}</span>
          <textarea
            name="ogDescription"
            defaultValue={values.ogDescription}
            placeholder={shownDesc}
            className={`${INPUT} min-h-[72px]`}
          />
        </label>

        <div>
          <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.ogImage")}</span>
          <MediaField name="ogImageUrl" typeName="ogImageType" initialUrl={values.ogImageUrl} />
          <span className="mt-1 block text-[11px] text-faint">
            {t("admin.seo.editor.1200630RecommendedBlank")}
          </span>
        </div>

        <p className="text-[11px] text-faint">
          {t("admin.seo.editor.theTwitterCardReuses")}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border2 pt-4">
        {saved ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-green">
            <IconCheck size={15} /> {t("admin.seo.editor.saved")}
          </span>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[8px] bg-ink px-5 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t("admin.seo.editor.save")}
        </button>
      </div>
    </form>
  );
}
