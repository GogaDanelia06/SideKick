"use client";

import clsx from "clsx";
import { IconChevronRight, type Icon } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export type RailItem = { key: string; label: Bilingual; icon: Icon };

/**
 * The second column: a list of the sections on one admin screen. Shared by
 * every screen that has more than one section so they stay identical — a
 * vertical list on desktop, a horizontal scroller on narrow viewports.
 */
export function SectionRail({
  items,
  active,
  onSelect,
}: {
  items: RailItem[];
  active: string;
  onSelect: (key: string) => void;
}) {
  const { t } = useLanguage();

  return (
    // `min-w-0` is what makes the horizontal scroller below actually scroll. A
    // grid child defaults to `min-width: auto`, so without it this box refuses
    // to shrink under its buttons, grows to their full width, and takes the
    // whole admin page sideways with it.
    <div className="min-w-0 rounded-lg border border-border bg-card p-3 lg:sticky lg:top-4">
      <div className="px-2 pb-2 text-[11px] uppercase tracking-wide text-faint">
        {t({ ka: "სექციები", en: "Sections" })}
      </div>
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((s) => {
          const on = active === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              aria-current={on ? "page" : undefined}
              className={clsx(
                "flex shrink-0 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] transition-colors",
                on
                  ? "bg-green-surface font-semibold text-green"
                  : "text-muted hover:bg-soft hover:text-ink",
              )}
            >
              <s.icon size={17} className="shrink-0" />
              <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{t(s.label)}</span>
              {on ? <IconChevronRight size={15} className="hidden shrink-0 lg:block" /> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/** The two-column body every multi-section admin screen uses. */
export function SectionLayout({
  rail,
  children,
}: {
  rail: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1100px)] lg:items-start">
      {rail}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
