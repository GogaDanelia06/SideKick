"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Save, discard and reset, with a count of unsaved changes; `children` sit above the buttons. */
export function ThemeActions({
  pending,
  status,
  changed,
  onDiscard,
  onReset,
  children,
}: {
  pending: boolean;
  status: "idle" | "saved" | "failed";
  /** How many colours differ from what is on the server, across both palettes. */
  changed: number;
  onDiscard: () => void;
  onReset: () => void;
  children?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex shrink-0 flex-col gap-2.5 rounded-xl border border-border bg-card p-3">
      {children}
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

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px]">
        <p className="text-muted">
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
          title={t({ ka: "ორივე თემას ნაგულისხმევ ფერებზე დააბრუნებს", en: "Puts both themes back to the shipped colours" })}
          className="text-muted underline hover:text-ink"
        >
          {t({ ka: "ნაგულისხმევზე დაბრუნება", en: "Reset to default" })}
        </button>
      </div>
    </div>
  );
}
