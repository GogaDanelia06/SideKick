import { DARK_QUERY, DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "./config";

/** What the operating system asks for; light when it does not say. */
export function systemTheme(): Theme {
  try {
    return matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

/** Calls `onChange` whenever the system setting flips; returns a function that stops it. */
export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  try {
    const media = matchMedia(DARK_QUERY);
    const listener = (event: MediaQueryListEvent) => onChange(event.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  } catch {
    return () => {};
  }
}

/** The theme the visitor picked on purpose, if any. */
export function chosenTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Remembers a pick that differs from the system setting. Picking the system's own theme
 * forgets the pick, so the site follows the system again from then on.
 */
export function rememberTheme(next: Theme): void {
  try {
    if (next === systemTheme()) localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage can be blocked; the pick then lasts until the page is left.
  }
}
