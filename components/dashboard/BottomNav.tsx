"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { DASH } from "@/lib/dashboard/routes";
import { DASH_NAV } from "@/lib/dashboard/nav";
import type { Bilingual } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TABS: { href: string; label: Bilingual }[] = [
  { href: DASH.home, label: { ka: "მთავარი", en: "Home" } },
  { href: DASH.conversations, label: { ka: "ჩათი", en: "Chats" } },
  { href: DASH.orders, label: { ka: "შეკვეთა", en: "Orders" } },
  { href: DASH.products, label: { ka: "პროდ.", en: "Products" } },
  { href: DASH.analytics, label: { ka: "სტატ.", en: "Stats" } },
];

const iconFor = (href: string) => DASH_NAV.find((n) => n.href === href)!.icon;

/** Mobile bottom tab bar (below lg). */
export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-[var(--topbar-bg)] px-2 backdrop-blur-[10px]",
        className,
      )}
    >
      {TABS.map((tab) => {
        const Icon = iconFor(tab.href);
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted",
            )}
          >
            <Icon size={20} />
            {t(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
