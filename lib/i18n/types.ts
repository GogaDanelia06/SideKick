/** Supported UI locales. Georgian (`ka`) is the primary/source language. */
export type Locale = "ka" | "en";

/** A value that exists in every locale. Content modules use this to keep the
 *  Georgian and English variants of a string colocated and type-checked. */
export type Bilingual<T = string> = Record<Locale, T>;
