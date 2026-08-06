"use client";

import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";

import { Logo } from "@/components/ui/Logo";
import { ACTIONS } from "@/lib/content/common";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROUTES } from "@/lib/routes";

import { LanguageToggle } from "./LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { Nav } from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[var(--header-bg)] backdrop-blur-[10px]">
      <div className="relative flex h-16 w-full items-center px-5 sm:px-8 lg:px-12">
        <div className="flex flex-1 justify-start">
          <Logo />
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <Nav className="flex" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <LanguageToggle />

          <ThemeToggle />

          <Link
            href={ROUTES.account}
            className="hidden h-[34px] items-center gap-2 rounded-sm border border-input px-3.5 text-sm font-medium text-ink md:inline-flex"
          >
            <IconUserCircle size={17} />
            {t(ACTIONS.profile)}
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}