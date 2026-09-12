import type { Bilingual } from "@/lib/content/types";

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
  label: Bilingual;
  hint: Bilingual;
  dark: string;
  light: string;
};

export const GROUPS: { id: TokenGroup; label: Bilingual; hint: Bilingual }[] = [
  { id: "site", label: { ka: "საიტი", en: "Public site" },
    hint: { ka: "მთავარი, ფასები, კონტაქტი — რასაც სტუმარი ხედავს", en: "Home, pricing, contact — what a visitor sees" } },
  { id: "dash", label: { ka: "დაშბორდი და ადმინი", en: "Dashboard & admin" },
    hint: { ka: "შესვლის შემდეგ — ეს გვერდიც აქ შედის", en: "After signing in — including this page" } },
  { id: "text", label: { ka: "ტექსტი", en: "Text" },
    hint: { ka: "ორივე ადგილას ერთნაირად", en: "The same in both places" } },
  { id: "accent", label: { ka: "აქცენტები", en: "Accents" },
    hint: { ka: "ღილაკები, ბმულები, სტატუსები", en: "Buttons, links, statuses" } },
];

export const TOKENS: ThemeToken[] = [
  { id: "bg", cssVar: "--bg", scope: "root", group: "site",
    label: { ka: "ფონი", en: "Background" }, hint: { ka: "გვერდის ფონი", en: "The page itself" },
    dark: "#0d1117", light: "#ffffff" },
  { id: "card", cssVar: "--card", scope: "root", group: "site",
    label: { ka: "ბარათები", en: "Cards" }, hint: { ka: "სექციები და ბლოკები", en: "Sections and blocks" },
    dark: "#161b22", light: "#f6f8fa" },
  { id: "siteBorder", cssVar: "--border", scope: "root", group: "site",
    label: { ka: "ხაზები", en: "Lines" }, hint: { ka: "ჩარჩოები და გამყოფები", en: "Borders and dividers" },
    dark: "#1f2937", light: "#d0d7de" },
  { id: "input", cssVar: "--input", scope: "root", group: "site",
    label: { ka: "ველების ჩარჩო", en: "Field borders" }, hint: { ka: "ფორმის ველები", en: "Form inputs" },
    dark: "#30363d", light: "#d0d7de" },

  { id: "canvas", cssVar: "--canvas", scope: "dash", group: "dash",
    label: { ka: "ფონი", en: "Background" }, hint: { ka: "ეკრანის ფონი", en: "Behind everything" },
    dark: "#0d1117", light: "#f6f8fa" },
  { id: "surface", cssVar: "--surface", scope: "dash", group: "dash",
    label: { ka: "გვერდითი მენიუ და ბარათები", en: "Sidebar & cards" }, hint: { ka: "მარცხენა მენიუ, პანელები", en: "The left menu and panels" },
    dark: "#161b22", light: "#ffffff" },
  { id: "soft", cssVar: "--soft", scope: "dash", group: "dash",
    label: { ka: "მსუბუქი შევსება", en: "Subtle fill" }, hint: { ka: "hover, ველები, ჩიპები", en: "Hover, inputs, chips" },
    dark: "#1c2128", light: "#f6f8fa" },
  { id: "dashBorder", cssVar: "--border", scope: "dash", group: "dash",
    label: { ka: "ხაზები", en: "Lines" }, hint: { ka: "ჩარჩოები", en: "Borders" },
    dark: "#30363d", light: "#d0d7de" },
  { id: "border2", cssVar: "--border2", scope: "dash", group: "dash",
    label: { ka: "სუსტი გამყოფი", en: "Faint divider" }, hint: { ka: "სიების შიგნით", en: "Inside lists" },
    dark: "#21262d", light: "#eaeef2" },
  { id: "faint", cssVar: "--faint", scope: "dash", group: "dash",
    label: { ka: "მინიშნებები", en: "Hints" }, hint: { ka: "პატარა ნაცრისფერი ტექსტი", en: "Small grey text" },
    dark: "#6e7681", light: "#818b98" },

  { id: "ink", cssVar: "--ink", scope: "root", group: "text",
    label: { ka: "მთავარი ტექსტი", en: "Main text" }, hint: { ka: "სათაურები და აბზაცები", en: "Headings and body" },
    dark: "#e6edf3", light: "#1f2328" },
  { id: "muted", cssVar: "--muted", scope: "root", group: "text",
    label: { ka: "მეორეული ტექსტი", en: "Secondary text" }, hint: { ka: "აღწერები, ლეიბლები", en: "Descriptions, labels" },
    dark: "#7d8590", light: "#59636e" },

  { id: "primary", cssVar: "--primary", scope: "root", group: "accent",
    label: { ka: "მთავარი ღილაკი", en: "Primary button" }, hint: { ka: "დაწყება, შენახვა", en: "Start, Save" },
    dark: "#238636", light: "#1f883d" },
  { id: "blue", cssVar: "--blue", scope: "root", group: "accent",
    label: { ka: "ბმულები", en: "Links" }, hint: { ka: "ბმულები და მონიშვნა", en: "Links and selection" },
    dark: "#58a6ff", light: "#0969da" },
  { id: "green", cssVar: "--green", scope: "root", group: "accent",
    label: { ka: "წარმატება", en: "Success" }, hint: { ka: "აქტიური, დაკავშირებულია", en: "Active, connected" },
    dark: "#3fb950", light: "#1a7f37" },
  { id: "amber", cssVar: "--amber", scope: "root", group: "accent",
    label: { ka: "გაფრთხილება", en: "Warning" }, hint: { ka: "მოლოდინში", en: "Pending" },
    dark: "#d29922", light: "#9a6700" },
  { id: "red", cssVar: "--red", scope: "root", group: "accent",
    label: { ka: "შეცდომა", en: "Error" }, hint: { ka: "წაშლა, გაუქმება", en: "Delete, cancel" },
    dark: "#f85149", light: "#cf222e" },
  { id: "ai", cssVar: "--ai", scope: "dash", group: "accent",
    label: { ka: "AI", en: "AI" }, hint: { ka: "AI-ს პასუხები", en: "AI replies" },
    dark: "#a371f7", light: "#8250df" },
];

export type Shade = "dark" | "light";
export type ThemeColors = Record<string, string>;

/** The shipped palette, as a plain object. Also the reset target. */
export function defaultColors(shade: Shade): ThemeColors {
  return Object.fromEntries(TOKENS.map((t) => [t.id, t[shade]]));
}
