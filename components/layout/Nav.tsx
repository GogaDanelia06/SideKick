"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/content/nav";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function Nav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className={clsx("items-center gap-7", className)}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "text-sm transition-colors",
            pathname === item.href ? "text-ink" : "text-muted hover:text-ink",
          )}
        >
          {t(item.label)}
        </Link>
      ))}
    </nav>
  );
}
