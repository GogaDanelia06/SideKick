const MTAVRULI = /[Ა-Ჿ]/;

export function initialOf(name: string, fallback = "?"): string {
  const first = [...name.trim()][0];
  if (!first) return fallback;
  const upper = first.toUpperCase();
  return MTAVRULI.test(upper) ? first : upper;
}
