import { commonRun } from "./lcs";
import type { DiffRow } from "./types";
import { likeness, mergeWords } from "./words";

/** Lines this alike are shown as one edited line, not as one removed and one added. */
const SIMILAR = 0.5;
/** Past this many line pairs in one stretch of changes, lines are not matched up at all. */
const MAX_PAIRS = 10_000;

/** Without line-ending differences, and without the empty lines a text happens to end with. */
function lines(text: string): string[] {
  const clean = text.replace(/\r\n?/g, "\n").trimEnd();
  return clean ? clean.split("\n") : [];
}

const sameLine = (x: string, y: string) => x.trimEnd() === y.trimEnd();

/** Matches removed lines to the lines that replaced them, in order, keeping only close ones. */
function pairUp(removed: string[], added: string[]): [number, number][] {
  if (removed.length * added.length > MAX_PAIRS) return [];

  const close = removed.map((line) => added.map((other) => likeness(line, other)));
  // best[i][j]: the most closeness that removed[i..] and added[j..] can be paired for.
  const best = Array.from({ length: removed.length + 1 }, () => new Array<number>(added.length + 1).fill(0));
  const together = (i: number, j: number) => (close[i][j] >= SIMILAR ? close[i][j] + best[i + 1][j + 1] : -1);
  for (let i = removed.length - 1; i >= 0; i--) {
    for (let j = added.length - 1; j >= 0; j--) {
      best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], together(i, j));
    }
  }

  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < removed.length && j < added.length) {
    if (together(i, j) >= best[i][j] && together(i, j) >= 0) pairs.push([i++, j++]);
    else if (best[i + 1][j] >= best[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** One stretch of changed lines. A line that was edited is shown once, with old and new words side by side. */
function change(removed: string[], added: string[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let r = 0;
  let a = 0;
  for (const [pr, pa] of [...pairUp(removed, added), [removed.length, added.length]]) {
    for (; r < pr; r++) rows.push({ kind: "removed", text: removed[r] });
    for (; a < pa; a++) rows.push({ kind: "added", text: added[a] });
    if (pr < removed.length) {
      rows.push({ kind: "edited", pieces: mergeWords(removed[pr], added[pa]) });
      r = pr + 1;
      a = pa + 1;
    }
  }
  return rows;
}

/** Two texts compared line by line, with every unchanged line kept. */
export function diffText(before: string, after: string): DiffRow[] {
  const a = lines(before);
  const b = lines(after);
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...commonRun(a, b, sameLine), [a.length, b.length]]) {
    rows.push(...change(a.slice(i, pi), b.slice(j, pj)));
    if (pi < a.length) rows.push({ kind: "same", text: b[pj] });
    i = pi + 1;
    j = pj + 1;
  }
  return rows;
}
