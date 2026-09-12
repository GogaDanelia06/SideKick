/** A validated form payload, or the error code to return. */
export type Parsed<T> = { data: T } | { error: string };

export function parsed<T>(data: T, error: string | null): Parsed<T> {
  return error ? { error } : { data };
}

/** `[min, max]`, so a range entered backwards still works. */
export function sortedPair(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a];
}

/** Only paths on this site or absolute http(s) URLs — never `javascript:`. */
export function safeUrl(raw: string, fallback: string): string {
  const value = raw.trim();
  if (!value) return fallback;
  if (value.startsWith("/")) return value;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : fallback;
  } catch {
    return fallback;
  }
}
