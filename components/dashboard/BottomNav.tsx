"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { DASH } from "@/lib/dashboard/routes";
import { DASH_NAV } from "@/lib/dashboard/nav";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const TABS: { href: string; label: Text }[] = [
  { href: DASH.home, label: "dashboard.bottomNav.home" },
  { href: DASH.conversations, label: "dashboard.bottomNav.chats" },
  { href: DASH.orders, label: "dashboard.bottomNav.orders" },
  { href: DASH.products, label: "dashboard.bottomNav.products" },
  { href: DASH.analytics, label: "dashboard.bottomNav.stats" },
];

const iconFor = (href: string) => DASH_NAV.find((n) => n.href === href)!.icon;

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
