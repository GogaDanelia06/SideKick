export type Locale = "ka" | "en";

export type Bilingual<T = string> = Record<Locale, T>;
