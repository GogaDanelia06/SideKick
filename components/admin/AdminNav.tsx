"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ADMIN_NAV } from "@/lib/admin/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex-1 overflow-auto p-2.5">
      {ADMIN_NAV.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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
