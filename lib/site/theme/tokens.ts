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
  { id: "text", label: { ka: "ტექსტი და ველები", en: "Text & fields" },
    hint: { ka: "ერთნაირია საიტზეც და დაშბორდშიც", en: "Shared by the site and the dashboard" } },
  { id: "accent", label: { ka: "აქცენტები", en: "Accents" },
    hint: { ka: "ღილაკები, ბმულები, სტატუსები", en: "Buttons, links, statuses" } },
];

export const TOKENS: ThemeToken[] = [
  { id: "bg", cssVar: "--bg", scope: "root", group: "site",
    label: { ka: "ფონი", en: "Background" }, hint: { ka: "საჯარო გვერდების ფონი", en: "Behind every public page" },
    dark: "#0d1117", light: "#ffffff" },
  { id: "card", cssVar: "--card", scope: "root", group: "site",
    label: { ka: "ბარათები", en: "Cards" }, hint: { ka: "ფასების ბოქსები, FAQ და სხვა ბლოკები", en: "Pricing boxes, FAQ and other blocks" },
    dark: "#161b22", light: "#f6f8fa" },
  { id: "siteBorder", cssVar: "--border", scope: "root", group: "site",
    label: { ka: "ხაზები", en: "Lines" }, hint: { ka: "ბარათების ჩარჩოები და მენიუს ქვედა ხაზი", en: "Card outlines and the line under the menu" },
    dark: "#1f2937", light: "#d0d7de" },

  { id: "canvas", cssVar: "--canvas", scope: "dash", group: "dash",
    label: { ka: "ფონი", en: "Background" }, hint: { ka: "დაშბორდისა და ადმინის ფონი", en: "Behind the dashboard and admin pages" },
    dark: "#0d1117", light: "#f6f8fa" },
  { id: "surface", cssVar: "--surface", scope: "dash", group: "dash",
    label: { ka: "გვერდითი მენიუ და ბარათები", en: "Sidebar & cards" }, hint: { ka: "მარცხენა მენიუ, პანელები, ფანჯრები", en: "The left menu, panels and pop-ups" },
    dark: "#161b22", light: "#ffffff" },
  { id: "soft", cssVar: "--soft", scope: "dash", group: "dash",
    label: { ka: "მსუბუქი შევსება", en: "Subtle fill" }, hint: { ka: "მონიშნული მენიუს პუნქტი, hover, ჩიპები", en: "Selected menu item, hover, chips" },
    dark: "#1c2128", light: "#f6f8fa" },
  { id: "dashBorder", cssVar: "--border", scope: "dash", group: "dash",
    label: { ka: "ხაზები", en: "Lines" }, hint: { ka: "პანელებისა და ბარათების ჩარჩოები", en: "Panel and card outlines" },
    dark: "#30363d", light: "#d0d7de" },
  { id: "border2", cssVar: "--border2", scope: "dash", group: "dash",
    label: { ka: "სუსტი გამყოფი", en: "Faint divider" }, hint: { ka: "ხაზები სიის ელემენტებს შორის", en: "Lines between list rows" },
    dark: "#21262d", light: "#eaeef2" },
  { id: "faint", cssVar: "--faint", scope: "dash", group: "dash",
    label: { ka: "მინიშნებები", en: "Hints" }, hint: { ka: "პატარა ნაცრისფერი წარწერები", en: "Small grey captions" },
    dark: "#6e7681", light: "#818b98" },

  { id: "ink", cssVar: "--ink", scope: "root", group: "text",
    label: { ka: "მთავარი ტექსტი", en: "Main text" }, hint: { ka: "სათაურები და ტექსტი — საიტზე და დაშბორდში", en: "Headings and body — site and dashboard" },
    dark: "#e6edf3", light: "#1f2328" },
  { id: "muted", cssVar: "--muted", scope: "root", group: "text",
    label: { ka: "მეორეული ტექსტი", en: "Secondary text" }, hint: { ka: "აღწერები, ლეიბლები, მენიუს პუნქტები", en: "Descriptions, labels, menu items" },
    dark: "#7d8590", light: "#59636e" },
  { id: "input", cssVar: "--input", scope: "root", group: "text",
    label: { ka: "ველების ჩარჩო", en: "Field borders" }, hint: { ka: "ტექსტის ველები — შესვლა, ფორმები, დაშბორდი", en: "Text fields — sign-in, forms, dashboard" },
    dark: "#30363d", light: "#d0d7de" },

  { id: "primary", cssVar: "--primary", scope: "root", group: "accent",
    label: { ka: "მთავარი ღილაკი", en: "Primary button" }, hint: { ka: "შენახვა, გაგზავნა, დაწყება", en: "Save, Send, Get started" },
    dark: "#238636", light: "#1f883d" },
  { id: "blue", cssVar: "--blue", scope: "root", group: "accent",
    label: { ka: "ბმულები", en: "Links" }, hint: { ka: "ბმულები, ფოკუსი, მონიშნული ველი", en: "Links, focus rings, selected fields" },
    dark: "#58a6ff", light: "#0969da" },
  { id: "green", cssVar: "--green", scope: "root", group: "accent",
    label: { ka: "წარმატება", en: "Success" }, hint: { ka: "აქტიური, დაკავშირებულია, ზრდა", en: "Active, connected, growth" },
    dark: "#3fb950", light: "#1a7f37" },
  { id: "amber", cssVar: "--amber", scope: "root", group: "accent",
    label: { ka: "გაფრთხილება", en: "Warning" }, hint: { ka: "მოლოდინში, ყურადღება", en: "Pending, needs attention" },
    dark: "#d29922", light: "#9a6700" },
  { id: "red", cssVar: "--red", scope: "root", group: "accent",
    label: { ka: "შეცდომა", en: "Error" }, hint: { ka: "შეცდომები, წაშლა", en: "Errors, delete buttons" },
    dark: "#f85149", light: "#cf222e" },
  { id: "ai", cssVar: "--ai", scope: "dash", group: "accent",
    label: { ka: "AI", en: "AI" }, hint: { ka: "AI-ს პასუხები, ტესტერის ღილაკი, AI გადამრთველები", en: "AI replies, the Tester button, AI switches" },
    dark: "#a371f7", light: "#8250df" },
];

export type Shade = "dark" | "light";
export type ThemeColors = Record<string, string>;

/** The shipped palette, as a plain object. Also the reset target. */
export function defaultColors(shade: Shade): ThemeColors {
  return Object.fromEntries(TOKENS.map((t) => [t.id, t[shade]]));
}
