import type { Text } from "@/lib/i18n/messages";

/** Admin-editable colours, grouped by where they appear. Everything else is derived (derive.ts). */

export type TokenScope = "root" | "dash";
export type TokenGroup = "site" | "dash" | "text" | "accent";

export type ThemeToken = {
  /** Key in the stored JSON. */
  id: string;
  /** The custom property it writes. */
  cssVar: string;
  scope: TokenScope;
  group: TokenGroup;
  label: Text;
  hint: Text;
  dark: string;
  light: string;
};

export const GROUPS: { id: TokenGroup; label: Text; hint: Text }[] = [
  { id: "site", label: "site.theme.tokens.publicSite",
    hint: "site.theme.tokens.hint" },
  { id: "text", label: "site.theme.tokens.textFields",
    hint: "site.theme.tokens.hint2" },
  { id: "dash", label: "site.theme.tokens.dashboardAdmin",
    hint: "site.theme.tokens.hint3" },
  { id: "accent", label: "site.theme.tokens.accents",
    hint: "site.theme.tokens.buttonsLinksStatuses" },
];

export const TOKENS: ThemeToken[] = [
  { id: "bg", cssVar: "--bg", scope: "root", group: "site",
    label: "site.theme.tokens.background", hint: "site.theme.tokens.behindEveryPublicPage",
    dark: "#0d1117", light: "#ffffff" },
  { id: "card", cssVar: "--card", scope: "root", group: "site",
    label: "site.theme.tokens.cards", hint: "site.theme.tokens.hint4",
    dark: "#161b22", light: "#f6f8fa" },
  { id: "siteBorder", cssVar: "--border", scope: "root", group: "site",
    label: "site.theme.tokens.lines", hint: "site.theme.tokens.hint5",
    dark: "#1f2937", light: "#d0d7de" },

  { id: "canvas", cssVar: "--canvas", scope: "dash", group: "dash",
    label: "site.theme.tokens.background", hint: "site.theme.tokens.hint6",
    dark: "#0d1117", light: "#f6f8fa" },
  { id: "surface", cssVar: "--surface", scope: "dash", group: "dash",
    label: "site.theme.tokens.sidebarCards", hint: "site.theme.tokens.hint7",
    dark: "#161b22", light: "#ffffff" },
  { id: "soft", cssVar: "--soft", scope: "dash", group: "dash",
    label: "site.theme.tokens.subtleFill", hint: "site.theme.tokens.selectedMenuItemHover",
    dark: "#1c2128", light: "#f6f8fa" },
  { id: "dashBorder", cssVar: "--border", scope: "dash", group: "dash",
    label: "site.theme.tokens.lines", hint: "site.theme.tokens.panelAndCardOutlines",
    dark: "#30363d", light: "#d0d7de" },
  { id: "border2", cssVar: "--border2", scope: "dash", group: "dash",
    label: "site.theme.tokens.faintDivider", hint: "site.theme.tokens.linesBetweenListRows",
    dark: "#21262d", light: "#eaeef2" },
  { id: "faint", cssVar: "--faint", scope: "dash", group: "dash",
    label: "site.theme.tokens.hints", hint: "site.theme.tokens.smallGreyCaptions",
    dark: "#6e7681", light: "#818b98" },

  { id: "ink", cssVar: "--ink", scope: "root", group: "text",
    label: "site.theme.tokens.mainText", hint: "site.theme.tokens.hint8",
    dark: "#e6edf3", light: "#1f2328" },
  { id: "muted", cssVar: "--muted", scope: "root", group: "text",
    label: "site.theme.tokens.secondaryText", hint: "site.theme.tokens.descriptionsLabelsMenuItems",
    dark: "#7d8590", light: "#59636e" },
  { id: "input", cssVar: "--input", scope: "root", group: "text",
    label: "site.theme.tokens.fieldBorders", hint: "site.theme.tokens.hint9",
    dark: "#30363d", light: "#d0d7de" },

  { id: "primary", cssVar: "--primary", scope: "root", group: "accent",
    label: "site.theme.tokens.primaryButton", hint: "site.theme.tokens.saveSendGetStarted",
    dark: "#238636", light: "#1f883d" },
  { id: "blue", cssVar: "--blue", scope: "root", group: "accent",
    label: "site.theme.tokens.links", hint: "site.theme.tokens.linksFocusRingsSelected",
    dark: "#58a6ff", light: "#0969da" },
  { id: "green", cssVar: "--green", scope: "root", group: "accent",
    label: "site.theme.tokens.success", hint: "site.theme.tokens.activeConnectedGrowth",
    dark: "#3fb950", light: "#1a7f37" },
  { id: "amber", cssVar: "--amber", scope: "root", group: "accent",
    label: "site.theme.tokens.warning", hint: "site.theme.tokens.pendingNeedsAttention",
    dark: "#d29922", light: "#9a6700" },
  { id: "red", cssVar: "--red", scope: "root", group: "accent",
    label: "site.theme.tokens.error", hint: "site.theme.tokens.errorsDeleteButtons",
    dark: "#f85149", light: "#cf222e" },
  { id: "ai", cssVar: "--ai", scope: "dash", group: "accent",
    label: "site.theme.tokens.ai", hint: "site.theme.tokens.hint10",
    dark: "#a371f7", light: "#8250df" },
];

export type Shade = "dark" | "light";
export type ThemeColors = Record<string, string>;

/** The shipped palette, as a plain object. Also the reset target. */
export function defaultColors(shade: Shade): ThemeColors {
  return Object.fromEntries(TOKENS.map((t) => [t.id, t[shade]]));
}
