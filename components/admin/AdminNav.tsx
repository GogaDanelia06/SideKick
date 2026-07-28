"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  ADMIN_BOX_NAV,
  ADMIN_CONTENT_NAV,
  ADMIN_LEGAL_NAV,
  ADMIN_NAV,
} from "@/lib/admin/routes";
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

      {/* Editable page texts — one entry per section of the public site. */}
      <div className="mb-1 mt-4 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        {t({ ka: "გვერდების ტექსტები", en: "Page content" })}
      </div>
      {[...ADMIN_BOX_NAV, ...ADMIN_CONTENT_NAV].map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "mb-0.5 flex flex-col rounded-[6px] px-2.5 py-2 transition-colors",
              active ? "bg-green-surface text-primary" : "text-ink hover:bg-soft",
            )}
          >
            <span className="text-[13px] font-medium">{t(item.label)}</span>
            <span className="text-[11px] text-faint">{t(item.page)}</span>
          </Link>
        );
      })}

      {/* Legal documents — section-by-section editors. */}
      <div className="mb-1 mt-4 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        {t({ ka: "იურიდიული", en: "Legal" })}
      </div>
      {ADMIN_LEGAL_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "mb-0.5 flex flex-col rounded-[6px] px-2.5 py-2 transition-colors",
              active ? "bg-green-surface text-primary" : "text-ink hover:bg-soft",
            )}
          >
            <span className="text-[13px] font-medium">{t(item.label)}</span>
            <span className="text-[11px] text-faint">{t(item.page)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
