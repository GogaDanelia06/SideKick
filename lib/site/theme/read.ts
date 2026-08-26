import { log } from "@/lib/logger";
import { getSiteValue } from "@/lib/site/content";
import { BG_KEY, findBackground } from "@/lib/site/backgrounds";
import { THEME_KEY, defaultTheme, sanitizeTheme, type Theme } from "./css";

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

/** The five original background presets, expressed in the new shape. */
function fromPreset(id: string | null): Theme {
  const theme = defaultTheme();
  const p = findBackground(id);
  theme.dark.bg = p.dark.bg;
  theme.dark.canvas = p.dark.canvas;
  theme.light.bg = p.light.bg;
  theme.light.canvas = p.light.canvas;
  return theme;
}
