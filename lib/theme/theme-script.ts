import { DARK_QUERY, DEFAULT_THEME, LEGACY_THEME_STORAGE_KEY, THEME_STORAGE_KEY } from "./config";

/**
 * Runs in <head> before the first paint: the visitor's own pick, otherwise the system
 * setting, otherwise light. Plain ES5, since it is inlined as a string.
 */
export const themeScript = `(function(){
  var theme = ${JSON.stringify(DEFAULT_THEME)};
  try { theme = matchMedia(${JSON.stringify(DARK_QUERY)}).matches ? "dark" : "light"; } catch (e) {}
  try {
    localStorage.removeItem(${JSON.stringify(LEGACY_THEME_STORAGE_KEY)});
    var chosen = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (chosen === "light" || chosen === "dark") theme = chosen;
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
})();`;
