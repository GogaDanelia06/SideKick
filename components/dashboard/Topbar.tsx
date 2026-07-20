"use client";

import { usePathname } from "next/navigation";
import { IconMenu2 } from "@tabler/icons-react";
import { DASH_META } from "@/lib/dashboard/meta";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Sticky page header: title + subtitle (per route), with a menu button on mobile. */
export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const meta = DASH_META[pathname] ?? DASH_META[DASH.home];

  return (
    <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-[var(--topbar-bg)] px-4 backdrop-blur-[8px] sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="grid size-9 shrink-0 place-items-center rounded-[6px] border border-border text-muted lg:hidden"
      >
        <IconMenu2 size={18} />
      </button>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold">{t(meta.title)}</div>
        <div className="truncate text-xs text-muted">{t(meta.subtitle)}</div>
      </div>
    </header>
  );
}
