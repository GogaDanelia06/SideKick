/** Mtavruli, the Georgian all-caps script that `toUpperCase` turns everyday Georgian into. */
const MTAVRULI = /[Ა-Ჿ]/;

/** The first letter of a name, for an avatar. Georgian keeps its everyday form; Latin is capitalised. */
export function initialOf(name: string, fallback = "?"): string {
  const first = [...name.trim()][0];
  if (!first) return fallback;
  const upper = first.toUpperCase();
  return MTAVRULI.test(upper) ? first : upper;
}
