"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { IconLock } from "@tabler/icons-react";
import { DASH_NAV } from "@/lib/dashboard/nav";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function NavList({ onNavigate, locked = false }: { onNavigate?: () => void; locked?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex-1 overflow-auto p-2.5">
      {DASH_NAV.map((item) => {
        const active = pathname === item.href;
        if (locked && item.href !== DASH.billing) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              title={t("dashboard.billing.locked.navHint")}
              className="mb-0.5 flex cursor-not-allowed items-center gap-3 rounded-[6px] px-2.5 py-2.5 text-sm font-medium text-faint"
            >
              <item.icon size={18} className="w-5 shrink-0" />
              <span className="flex-1">{t(item.label)}</span>
              <IconLock size={14} />
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "mb-0.5 flex items-center gap-3 rounded-[6px] px-2.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-green-surface text-primary" : "text-ink hover:bg-soft",
            )}
          >
            <item.icon size={18} className="w-5 shrink-0" />
            <span className="flex-1">{t(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
