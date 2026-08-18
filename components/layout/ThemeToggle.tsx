"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme/useTheme";
import { track } from "@/lib/analytics/track";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  // The icon is the theme you would get, not the one you are in. A sun while
  // the page is already bright describes the room rather than offering
  // anything, and every button beside it names its own outcome.
  const Icon = theme === "light" ? IconMoon : IconSun;

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        track("theme_change");
      }}
      aria-label="Toggle color theme"
      className="grid size-[34px] place-items-center rounded-sm border border-border text-muted transition-colors hover:text-ink"
    >
      <Icon size={17} />
    </button>
  );
}
