import type { DiffRow } from "./types";
import { isWord, parts } from "./words";

export const hasChanges = (rows: DiffRow[]) => rows.some((row) => row.kind !== "same" && row.kind !== "gap");

const wordsIn = (text: string) => parts(text).filter(isWord).length;

/** How many words were added and how many removed. */
export function countChanges(rows: DiffRow[]): { added: number; removed: number } {
  const count = { added: 0, removed: 0 };
  for (const row of rows) {
    if (row.kind === "removed") count.removed += wordsIn(row.text);
    else if (row.kind === "added") count.added += wordsIn(row.text);
    else if (row.kind === "edited") {
      for (const piece of row.pieces) {
        if (piece.kind !== "same") count[piece.kind] += wordsIn(piece.text);
      }
    }
  }
  return count;
}

/** Keeps the lines around each change and folds the longer stretches between them into one gap. */
export function foldUnchanged(rows: DiffRow[], around = 1): DiffRow[] {
  const keep = rows.map(() => false);
  rows.forEach((row, i) => {
    if (row.kind === "same") return;
    for (let k = Math.max(0, i - around); k <= Math.min(rows.length - 1, i + around); k++) keep[k] = true;
  });

  const out: DiffRow[] = [];
  for (let i = 0; i < rows.length; ) {
    if (keep[i]) {
      out.push(rows[i++]);
      continue;
    }
    let end = i;
    while (end < rows.length && !keep[end]) end++;
    // A gap that hides a single line saves nothing: show the line.
    if (end - i === 1) out.push(rows[i]);
    else out.push({ kind: "gap", count: end - i });
    i = end;
  }
  return out;
}
