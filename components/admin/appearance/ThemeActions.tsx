"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

/** Save, discard and reset, with a count of unsaved changes. */
export function ThemeActions({
  pending,
  status,
  changed,
  onDiscard,
  onReset,
}: {
  pending: boolean;
  status: "idle" | "saved" | "failed";
  /** How many colours differ from what is on the server, across both palettes. */
  changed: number;
  onDiscard: () => void;
  onReset: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || changed === 0}
          className="h-9 flex-1 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={pending || changed === 0}
          className="h-9 rounded-[8px] border border-border px-3 text-[12px] text-muted hover:text-ink disabled:opacity-40"
        >
          {t({ ka: "გაუქმება", en: "Discard" })}
        </button>
      </div>

      <p className="text-[11px] text-muted">
        {status === "saved"
          ? t({ ka: "შენახულია — საიტზე უკვე აისახა.", en: "Saved — the site already shows it." })
          : status === "failed"
            ? t({ ka: "ვერ შეინახა. სცადე ხელახლა.", en: "Could not save. Try again." })
            : changed === 0
              ? t({ ka: "შენახულის იდენტურია.", en: "Matches what is saved." })
              : `${changed} ${t({ ka: "შეუნახავი ცვლილება", en: "unsaved change(s)" })}`}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="w-fit text-[11px] text-faint underline hover:text-muted"
      >
        {t({ ka: "ამ თემის ნაგულისხმევზე დაბრუნება", en: "Reset this theme to default" })}
      </button>
    </div>
  );
}
