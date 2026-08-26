import { log } from "@/lib/logger";
import { getSiteValue } from "@/lib/site/content";
import { findPreset, presetColors } from "./presets";
import { THEME_KEY, defaultTheme, sanitizeTheme, type Theme } from "./css";

/** The background-only setting this screen shipped with. */
export const BG_KEY = "site_bg";

/**
 * The saved palette, or the shipped one.
 *
 * Falls back through the older `site_bg` preset on purpose. That setting shipped
 * first and a choice is already live under it; reading only the new key would
 * quietly reset the site to grey the moment this deployed.
 */
export async function readTheme(): Promise<Theme> {
  const [stored, preset] = await Promise.all([getSiteValue(THEME_KEY), getSiteValue(BG_KEY)]);

  if (stored) {
    try {
      return sanitizeTheme(JSON.parse(stored));
    } catch {
      // Unparseable means someone edited the row by hand. The shipped palette is
      // a far better answer than a page with no colours, but it should not pass
      // without a trace — nothing else would ever explain the reset.
      log.warn("stored theme is not valid JSON — falling back", { key: THEME_KEY });
    }
  }

  return fromPreset(preset);
}

/**
 * The old background-only choice, in the new shape.
 *
 * Only `bg` and `canvas` are carried across, not the whole preset. Someone who
 * picked a background months ago did not choose new borders and a new grey, and
 * a deploy is the wrong moment to decide they did.
 */
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
