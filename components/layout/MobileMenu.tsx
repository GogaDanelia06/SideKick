"use client";

import { useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { IconMenu2, IconUserCircle, IconX } from "@tabler/icons-react";
import { NAV_ITEMS } from "@/lib/content/nav";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function MobileMenu() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const ref = useDismiss<HTMLDivElement>(open, close);

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-[34px] place-items-center rounded-sm border border-border text-muted"
      >
        {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
      </button>
      {open ? (
        <>
          <nav className="fixed inset-x-0 top-16 z-50 flex flex-col gap-1 border-b border-border bg-card p-4 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={clsx(
                  "rounded-sm px-3 py-3 text-sm transition-colors",
                  pathname === item.href ? "bg-card2 text-ink" : "text-muted hover:text-ink",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
            <Link
              href={ROUTES.login}
              onClick={close}
              className="mt-1 inline-flex items-center gap-2 rounded-sm border border-input px-3 py-3 text-sm font-medium text-ink"
            >
              <IconUserCircle size={17} />
              {t(ACTIONS.profile)}
            </Link>
          </nav>
        </>
      ) : null}
    </div>
  );
}
