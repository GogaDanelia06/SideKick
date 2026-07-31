"use client";

import { useState, useTransition } from "react";
import type { ChannelGuide, ChannelType } from "@prisma/client";
import {
  IconAlertTriangle,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { saveChannelGuide, toggleChannelGuidePublished } from "@/lib/admin/actions";
import { CHANNEL_NAMES, CHANNEL_TYPES } from "@/lib/dashboard/channels";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const AREA =
  "min-h-[132px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Bilingual> = {
  bad_url: { ka: "მიუთითეთ სწორი YouTube ბმული", en: "Enter a valid YouTube link" },
  not_found: { ka: "ვერ მოიძებნა", en: "Not found" },
};

const ICONS: Record<ChannelType, { Icon: Icon; color: string }> = {
  FACEBOOK: { Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { Icon: IconWorld, color: "var(--blue)" },
};

function GuideForm({ type, guide }: { type: ChannelType; guide?: ChannelGuide }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const published = guide?.published ?? true;
  const { Icon: Brand, color } = ICONS[type];

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
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-soft" style={{ color }}>
          <Brand size={20} />
        </span>
        <span className="flex-1 font-semibold">{CHANNEL_NAMES[type]}</span>

        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { await toggleChannelGuidePublished(type, !published); })}
          aria-label={t({ ka: "გამოქვეყნება", en: "Toggle publish" })}
          className="grid size-8 shrink-0 place-items-center rounded-[7px] border border-border text-muted hover:text-ink disabled:opacity-40"
        >
          {published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
        </button>
      </div>

      <div className="grid gap-2.5">
        <input
          name="youtubeUrl"
          defaultValue={guide?.youtubeUrl ?? ""}
          placeholder={t({ ka: "YouTube ბმული (არასავალდებულო)", en: "YouTube link (optional)" })}
          className={INPUT}
        />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <textarea name="bodyKa" defaultValue={guide?.bodyKa ?? ""} placeholder={t({ ka: "ნაბიჯები (ქართ.) — თითო ხაზზე თითო", en: "Steps (KA) — one per line" })} className={AREA} />
          <textarea name="bodyEn" defaultValue={guide?.bodyEn ?? ""} placeholder={t({ ka: "ნაბიჯები (ინგ.) — თითო ხაზზე თითო", en: "Steps (EN) — one per line" })} className={AREA} />
        </div>
      </div>

      {error ? (
        <div className="mt-3 flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && !pending ? (
          <span className="inline-flex items-center gap-1 text-[13px] text-green">
            <IconCheck size={15} /> {t({ ka: "შენახულია", en: "Saved" })}
          </span>
        ) : null}
        <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
          {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
        </button>
      </div>
    </form>
  );
}

/**
 * One form per channel type — the set is fixed by the schema, so there is
 * nothing to add or delete here, only to fill in. A channel with an empty
 * guide simply shows no instructions button in the tenant's dashboard.
 */
export function ChannelGuidesEditor({ guides }: { guides: ChannelGuide[] }) {
  const { t } = useLanguage();
  const byType = new Map(guides.map((g) => [g.type, g]));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-faint">
        {t({
          ka: "ეს ინსტრუქციები გამოჩნდება მომხმარებლის „არხების“ გვერდზე, თითოეული არხის გვერდით.",
          en: "These appear next to each channel on the tenant's Channels screen.",
        })}
      </p>

      {CHANNEL_TYPES.map((type) => (
        <GuideForm key={type} type={type} guide={byType.get(type)} />
      ))}
    </div>
  );
}
