import ka from "@/messages/ka";
import en from "@/messages/en";
import type { Bilingual, Locale } from "./types";

const CATALOGUE = { ka, en } satisfies Record<Locale, unknown>;

type Branch = { [key: string]: string | Branch };

type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];

export type MessageKey = Paths<typeof ka>;

export type Vars = Record<string, string | number>;

export type Phrase = { key: MessageKey; vars: Vars };

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

export function message(locale: Locale, key: MessageKey, vars?: Vars): string {
  const text = lookup(locale, key) ?? lookup(locale === "ka" ? "en" : "ka", key);
  if (text === undefined) return key;
  return vars ? text.replace(FILLER, (whole, name: string) => String(vars[name] ?? whole)) : text;
}

export function textIn(locale: Locale, value: Text, vars?: Vars): string {
  if (typeof value === "string") return message(locale, value, vars);
  return "key" in value ? message(locale, value.key, { ...value.vars, ...vars }) : value[locale];
}
