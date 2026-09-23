import ka from "@/messages/ka.json";
import en from "@/messages/en.json";
import type { Bilingual, Locale } from "./types";

/**
 * Every word the interface says lives in messages/ka.json and messages/en.json, under a
 * key like `dashboard.profile.saved`. The two files hold the same keys — a test keeps
 * them that way — so a key is enough to name a string in either language.
 *
 * Page copy is not here: the landing, pricing and legal pages are edited in the admin
 * and kept in the database (lib/content holds their first draft).
 */
const CATALOGUE = { ka, en } satisfies Record<Locale, unknown>;

type Branch = { [key: string]: string | Branch };

/** Every dotted path through ka.json, so a wrong key is a mistake the compiler catches. */
type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];

export type MessageKey = Paths<typeof ka>;

/** Values a message can be given, for the few strings with a name or a number in them. */
export type Vars = Record<string, string | number>;

/** A message together with the values it asks for, for text built away from where it is shown. */
export type Phrase = { key: MessageKey; vars: Vars };

/** Anything that can be shown to a person: a key of ours, or text the database holds. */
export type Text = MessageKey | Phrase | Bilingual;

export const phrase = (key: MessageKey, vars: Vars): Phrase => ({ key, vars });

const FILLER = /\{(\w+)\}/g;

function lookup(locale: Locale, key: string): string | undefined {
  let node: string | Branch | undefined = CATALOGUE[locale] as Branch;
  for (const step of key.split(".")) {
    if (typeof node !== "object") return undefined;
    node = node[step];
  }
  return typeof node === "string" ? node : undefined;
}

/** One message, in one language. An unknown key gives back the key, rather than nothing. */
export function message(locale: Locale, key: MessageKey, vars?: Vars): string {
  const text = lookup(locale, key) ?? lookup(locale === "ka" ? "en" : "ka", key);
  if (text === undefined) return key;
  return vars ? text.replace(FILLER, (whole, name: string) => String(vars[name] ?? whole)) : text;
}

/** Any kind of text, in one language. */
export function textIn(locale: Locale, value: Text, vars?: Vars): string {
  if (typeof value === "string") return message(locale, value, vars);
  return "key" in value ? message(locale, value.key, { ...value.vars, ...vars }) : value[locale];
}
