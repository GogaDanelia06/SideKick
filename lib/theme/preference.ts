import { DARK_QUERY, DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "./config";

export function systemTheme(): Theme {
  try {
    return matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

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

export function chosenTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function rememberTheme(next: Theme): void {
  try {
    if (next === systemTheme()) localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {}
}
