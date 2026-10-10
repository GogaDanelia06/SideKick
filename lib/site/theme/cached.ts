import { unstable_cache } from "next/cache";
import { readTheme } from "./read";

export const THEME_TAG = "site-theme";

export const cachedTheme = unstable_cache(readTheme, [THEME_TAG], {
  tags: [THEME_TAG],
  revalidate: 3600,
});
