import { TOKENS, defaultColors, type Shade, type ThemeColors } from "./tokens";
import { derived, isHex } from "./derive";

export type Theme = { dark: ThemeColors; light: ThemeColors };

export const THEME_KEY = "site_theme";

export function sanitize(input: unknown, shade: Shade): ThemeColors {
  const raw = (input ?? {}) as Record<string, unknown>;
  const out = defaultColors(shade);
  for (const token of TOKENS) {
    const value = raw[token.id];
    if (isHex(value)) out[token.id] = value.toLowerCase();
  }
  return out;
}

export function sanitizeTheme(input: unknown): Theme {
  const raw = (input ?? {}) as Record<string, unknown>;
  return { dark: sanitize(raw.dark, "dark"), light: sanitize(raw.light, "light") };
}

export function defaultTheme(): Theme {
  return { dark: defaultColors("dark"), light: defaultColors("light") };
}

function block(selector: string, vars: ThemeColors): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return body ? `${selector}{${body}}` : "";
}

function varsFor(colors: ThemeColors, shade: Shade) {
  const d = derived(colors, shade);
  const root: ThemeColors = { ...d.root };
  const dash: ThemeColors = { ...d.dash };
  for (const token of TOKENS) {
    (token.scope === "dash" ? dash : root)[token.cssVar] = colors[token.id];
  }
  return { root, dash };
}

export function themeCss(theme: Theme): string {
  const dark = varsFor(theme.dark, "dark");
  const light = varsFor(theme.light, "light");
  return [
    block("html:root", dark.root),
    block("html .dash-scope", dark.dash),
    block('html:root[data-theme="light"]', light.root),
    block('html:root[data-theme="light"] .dash-scope', light.dash),
  ].join("");
}
