"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * Save and discard, kept in view at the bottom of the screen while the colours are
 * edited. `children` (the readability check) sit at the start of the bar. Going back
 * to the shipped colours is the "Default" palette.
 */
export function ThemeActions({
  pending,
  status,
  changed,
  onDiscard,
  children,
}: {
  pending: boolean;
  status: "idle" | "saved" | "failed";
  /** How many colours differ from what is on the server, across both themes. */
  changed: number;
  onDiscard: () => void;
  children?: ReactNode;
}) {
  const { t } = useLanguage();

  const message =
    status === "saved"
      ? t("admin.appearance.themeActions.savedTheSiteAlready")
      : status === "failed"
        ? t("admin.appearance.themeActions.couldNotSaveTry")
        : changed === 0
          ? t("admin.appearance.themeActions.matchesWhatIsSaved")
          : `${changed} ${t("admin.appearance.themeActions.unsavedChangeS")}`;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-3 shadow-[0_8px_28px_rgba(0,0,0,0.2)]">
      <div className="min-w-0 flex-1 basis-60">{children}</div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <p className={`mr-auto text-[12px] sm:mr-2 ${status === "failed" ? "text-red" : "text-muted"}`}>{message}</p>
        <button
          type="button"
          onClick={onDiscard}
          disabled={pending || changed === 0}
          className="h-9 rounded-[8px] border border-border px-3 text-[13px] text-muted hover:text-ink disabled:opacity-40"
        >
          {t("admin.appearance.themeActions.discard")}
        </button>
        <button
          type="submit"
          disabled={pending || changed === 0}
          className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60 sm:min-w-[110px]"
        >
          {pending ? "…" : t("admin.appearance.themeActions.save")}
        </button>
      </div>
    </div>
  );
}
