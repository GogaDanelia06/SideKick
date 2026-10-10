import { log } from "@/lib/logger";
import { getSiteValue } from "@/lib/site/content";
import { findPreset, presetColors } from "./presets";
import { THEME_KEY, defaultTheme, sanitizeTheme, type Theme } from "./css";

export const BG_KEY = "site_bg";

export async function readTheme(): Promise<Theme> {
  const [stored, preset] = await Promise.all([getSiteValue(THEME_KEY), getSiteValue(BG_KEY)]);

  if (stored) {
    try {
      return sanitizeTheme(JSON.parse(stored));
    } catch {
      log.warn("stored theme is not valid JSON — falling back", { key: THEME_KEY });
    }
  }

  return fromPreset(preset);
}

function fromPreset(id: string | null): Theme {
  const theme = defaultTheme();
  const p = findPreset(id);
  for (const shade of ["dark", "light"] as const) {
    const colors = presetColors(p, shade);
    theme[shade].bg = colors.bg;
    theme[shade].canvas = colors.canvas;
  }
  return theme;
}
