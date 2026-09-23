"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme/useTheme";
import { track } from "@/lib/analytics/track";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function ThemeToggle() {
  const { t } = useLanguage();
  const { theme, toggle } = useTheme();

  // The icon shows the theme you would switch to.
  const Icon = theme === "light" ? IconMoon : IconSun;

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        track("theme_change");
      }}
      aria-label={t("layout.themeToggle")}
      className="grid size-[34px] place-items-center rounded-sm border border-border text-muted transition-colors hover:text-ink"
    >
      <Icon size={17} />
    </button>
  );
}
