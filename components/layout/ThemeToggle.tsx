"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === "light" ? IconSun : IconMoon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="grid size-[34px] place-items-center rounded-sm border border-border text-muted transition-colors hover:text-ink"
    >
      <Icon size={17} />
    </button>
  );
}
