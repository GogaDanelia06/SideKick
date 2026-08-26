"use client";

import { useEffect, useState, useTransition } from "react";
import { IconCheck } from "@tabler/icons-react";
import { BACKGROUNDS, backgroundPreviewCss } from "@/lib/site/backgrounds";
import { updateBackground } from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const PREVIEW_ID = "background-preview";

/**
 * Picking a background changes it on screen straight away, before saving.
 *
 * This admin panel sits inside `.dash-scope`, so it is one of the surfaces the
 * setting controls — the preview is the real thing, not a mockup of it. Leaving
 * the page without saving removes the style element and the saved choice comes
 * back, so nothing is committed by looking.
 */
export function BackgroundPicker({ current }: { current: string }) {
  const { t } = useLanguage();
  const [choice, setChoice] = useState(current);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = PREVIEW_ID;
    style.textContent = backgroundPreviewCss(choice);
    document.head.append(style);
    return () => style.remove();
  }, [choice]);

  function save(fd: FormData) {
    setSaved(false);
    setFailed(false);
    start(async () => {
      const res = await updateBackground(fd);
      if (!res.ok) return setFailed(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form action={save} className="flex max-w-[720px] flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {BACKGROUNDS.map((b) => {
          const active = b.id === choice;
          return (
            <label
              key={b.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors ${
                active ? "border-blue ring-1 ring-blue-ring" : "border-border hover:border-ink/40"
              }`}
            >
              <input
                type="radio"
                name="background"
                value={b.id}
                checked={active}
                onChange={() => setChoice(b.id)}
                className="sr-only"
              />
              <span className="flex gap-1">
                <span
                  aria-hidden
                  style={{ background: b.dark.bg }}
                  className="size-8 rounded-l-md border border-border"
                />
                <span
                  aria-hidden
                  style={{ background: b.light.bg }}
                  className="size-8 rounded-r-md border border-border"
                />
              </span>
              <span className="flex-1 text-[13px] font-medium">{t(b.label)}</span>
              {/* A check, not colour alone — the swatches themselves are the
                  one thing on this screen that cannot carry the selected state. */}
              {active ? <IconCheck size={16} className="text-blue" /> : null}
            </label>
          );
        })}
      </div>

      <p className="text-[12px] text-muted">
        {t({
          ka: "ორივე ფერი ერთი არჩევანია — მარცხნივ მუქი თემა, მარჯვნივ ღია. იცვლება მხოლოდ ფონი: ტექსტი, ბარათები და ღილაკები უცვლელი რჩება.",
          en: "Each option is one choice with two shades — dark theme on the left, light on the right. Only the background moves; text, cards and buttons stay as they are.",
        })}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || choice === current}
          className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
        </button>
        {saved ? (
          <span className="text-[12px] text-green">{t({ ka: "შენახულია", en: "Saved" })}</span>
        ) : null}
        {failed ? (
          <span className="text-[12px] text-red">
            {t({ ka: "ვერ შეინახა — სცადე ხელახლა", en: "Could not save — try again" })}
          </span>
        ) : null}
      </div>
    </form>
  );
}
