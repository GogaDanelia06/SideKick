"use client";

import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Nav } from "./Nav";
import { MobileMenu } from "./MobileMenu";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { ACTIONS } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[var(--header-bg)] backdrop-blur-[10px]">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <Nav className="hidden md:flex" />
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href={ROUTES.login}
            className="hidden h-[34px] items-center gap-2 rounded-sm border border-input px-3.5 text-sm font-medium text-ink md:inline-flex"
          >
            <IconUserCircle size={17} />
            {t(ACTIONS.profile)}
          </Link>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
