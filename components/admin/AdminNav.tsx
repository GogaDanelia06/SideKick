"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ADMIN_NAV } from "@/lib/admin/routes";
import { ADMIN_PAGES } from "@/lib/admin/pages";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Platform screens, then one entry per public page (its sections open in a second column). */
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

      <div className="mb-1 mt-4 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        {t({ ka: "საიტის გვერდები", en: "Site pages" })}
      </div>
      {ADMIN_PAGES.map((p) => {
        const href = `/admin/page/${p.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={p.slug}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "mb-0.5 flex items-center gap-3 rounded-[6px] px-2.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-green-surface text-primary" : "text-ink hover:bg-soft",
            )}
          >
            <p.icon size={18} className="w-5 shrink-0" />
            <span className="flex-1">{t(p.label)}</span>
            <span className="text-[11px] text-faint">{p.sections.length}</span>
          </Link>
        );
      })}
    </nav>
  );
}
