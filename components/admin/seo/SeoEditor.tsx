"use client";

import { useState, useTransition } from "react";
import { IconCheck } from "@tabler/icons-react";
import { updateSeo } from "@/lib/admin/actions/seo";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { GooglePreview } from "./GooglePreview";
import { IndexingToggle } from "./IndexingToggle";
import { SearchFields } from "./SearchFields";
import { ERRORS, type SeoValues } from "./seoForm";
import { SocialFields } from "./SocialFields";
import { UrlFields } from "./UrlFields";

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

  const shownTitle = title || defaults.title;
  const shownDesc = description || defaults.description;

  return (
    <form action={save} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-muted">
          {t("admin.seo.editor.page")} <span className="font-mono text-ink">{path}</span>
        </div>
        <p className="text-[11px] text-faint">{t("admin.seo.editor.aBlankFieldMeans")}</p>
      </div>

      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t("admin.seo.editor.thisSectionOnlyChanges")}
      </p>

      {error ? <ErrorBanner>{t(ERRORS[error] ?? "admin.seo.editor.somethingWentWrong")}</ErrorBanner> : null}

      <SearchFields
        title={title}
        description={description}
        defaults={defaults}
        onTitle={setTitle}
        onDescription={setDescription}
      />
      <GooglePreview title={shownTitle} description={shownDesc} siteUrl={defaults.siteUrl} path={path} />
      <UrlFields path={path} canonical={values.canonical} />
      <IndexingToggle indexable={indexable} onToggle={() => setIndexable((v) => !v)} />
      <SocialFields values={values} fallbackTitle={shownTitle} fallbackDescription={shownDesc} />

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
