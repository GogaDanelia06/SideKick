import { unstable_cache } from "next/cache";
import { readTheme } from "./read";

export const THEME_TAG = "site-theme";

/**
 * The theme for the root layout, served from the data cache so uncached requests
 * skip the database. `updateTheme` expires the tag. Errors are not caught: a
 * failed rebuild then keeps serving the last good page.
 */
export const cachedTheme = unstable_cache(readTheme, [THEME_TAG], {
  tags: [THEME_TAG],
  revalidate: 3600,
});
