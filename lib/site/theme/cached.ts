import { unstable_cache } from "next/cache";
import { readTheme } from "./read";

/** Expired by `updateTheme` on save. */
export const THEME_TAG = "site-theme";

/**
 * The palette as the root layout reads it: out of Next's data cache, not the
 * database.
 *
 * The root layout runs on every request that is not a cached page — each
 * dashboard click, the sign-in pages, every `/try` redirect — while the colours
 * change a few times a year. Read live, that was two queries per request, and on
 * a page with no other reason to touch the database it was also the query that
 * woke the database up.
 *
 * Saving the theme expires the tag, so a new palette shows on the next load; the
 * hour is only a backstop for a row changed by hand. The admin editor keeps
 * calling `readTheme` directly, because it must never start from a stale copy.
 *
 * Deliberately no fallback on error. When a cached page fails to rebuild, the
 * last good copy keeps being served; a caught error would instead bake the
 * shipped palette into the page for the rest of the hour.
 */
export const cachedTheme = unstable_cache(readTheme, [THEME_TAG], {
  tags: [THEME_TAG],
  revalidate: 3600,
});
