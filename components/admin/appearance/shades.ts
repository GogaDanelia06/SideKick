import { IconMoon, IconSun, type Icon } from "@tabler/icons-react";
import type { Shade } from "@/lib/site/theme/tokens";
import type { Text } from "@/lib/i18n/messages";

export const SHADES: readonly Shade[] = ["dark", "light"];

export const SHADE_LABEL: Record<Shade, Text> = {
  dark: "admin.appearance.shades.darkTheme",
  light: "admin.appearance.shades.lightTheme",
};

export const SHADE_ICON: Record<Shade, Icon> = { dark: IconMoon, light: IconSun };

/** Shared by each colour input and the column heading above it, so the two line up. */
export const PICKER_WIDTH = "w-[146px]";
