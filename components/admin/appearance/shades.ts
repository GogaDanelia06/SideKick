import { IconMoon, IconSun, type Icon } from "@tabler/icons-react";
import type { Shade } from "@/lib/site/theme/tokens";
import type { Bilingual } from "@/lib/content/types";

export const SHADES: readonly Shade[] = ["dark", "light"];

export const SHADE_LABEL: Record<Shade, Bilingual> = {
  dark: { ka: "მუქი თემა", en: "Dark theme" },
  light: { ka: "ღია თემა", en: "Light theme" },
};

export const SHADE_ICON: Record<Shade, Icon> = { dark: IconMoon, light: IconSun };

/** Shared by each colour input and the column heading above it, so the two line up. */
export const PICKER_WIDTH = "w-[164px]";
