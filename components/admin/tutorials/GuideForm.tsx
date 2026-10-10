"use client";

import { useState, useTransition } from "react";
import type { ChannelGuide, ChannelType } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { saveChannelGuide, toggleChannelGuidePublished } from "@/lib/admin/actions/channelGuides";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { GuideHeader } from "./GuideHeader";
import { AREA, ERRORS, INPUT } from "./guideConfig";

export function GuideForm({ type, guide }: { type: ChannelType; guide?: ChannelGuide }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const published = guide?.published ?? true;

  function submit(fd: FormData) {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveChannelGuide(type, fd);
      if (!res.ok) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <form action={submit} className="rounded-lg border border-border bg-card p-4">
      <GuideHeader
        type={type}
        published={published}
        pending={pending}
        onToggle={() => start(async () => { await toggleChannelGuidePublished(type, !published); })}
      />

      <div className="grid gap-2.5">
        <input
          name="youtubeUrl"
          defaultValue={guide?.youtubeUrl ?? ""}
          placeholder={t("admin.tutorials.channelGuidesEditor.youtubeLinkOptional")}
          className={INPUT}
        />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <textarea
            name="bodyKa"
            defaultValue={guide?.bodyKa ?? ""}
            placeholder={t("admin.tutorials.channelGuidesEditor.stepsKaOnePer")}
            className={AREA}
          />
          <textarea
            name="bodyEn"
            defaultValue={guide?.bodyEn ?? ""}
            placeholder={t("admin.tutorials.channelGuidesEditor.stepsEnOnePer")}
            className={AREA}
          />
        </div>
      </div>

      {error ? (
        <ErrorBanner className="mt-3">
          {t(ERRORS[error] ?? "admin.tutorials.channelGuidesEditor.somethingWentWrong")}
        </ErrorBanner>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && !pending ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-green">
            <IconCheck size={15} /> {t("admin.tutorials.channelGuidesEditor.saved")}
          </span>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t("admin.tutorials.channelGuidesEditor.save")}
        </button>
      </div>
    </form>
  );
}
