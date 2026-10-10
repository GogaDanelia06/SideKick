import { commonRun } from "./lcs";
import type { Edit } from "./types";

const PARTS = /[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]/gu;
const WORD = /^[\p{L}\p{M}\p{N}]/u;
const SPACE = /^\s+$/;

export function parts(line: string): string[] {
  return line.match(PARTS) ?? [];
}

export const isWord = (part: string) => WORD.test(part);

export function likeness(a: string, b: string): number {
  const x = parts(a).filter(isWord);
  const y = parts(b).filter(isWord);
  if (x.length + y.length === 0) return 0;
  return (2 * commonRun(x, y).length) / (x.length + y.length);
}

type Kept = { kept: string };
type Swap = { removed: string; added: string };
type Segment = Kept | Swap;

const isKept = (segment: Segment): segment is Kept => "kept" in segment;
const isReplacement = (segment: Segment | undefined): segment is Swap =>
  segment !== undefined && !isKept(segment) && segment.removed !== "" && segment.added !== "";

function segments(before: string, after: string): Segment[] {
  const a = parts(before);
  const b = parts(after);
  const out: Segment[] = [];
  let i = 0;
  let j = 0;
  for (const [pa, pb] of [...commonRun(a, b), [a.length, b.length]]) {
    const removed = a.slice(i, pa).join("");
    const added = b.slice(j, pb).join("");
    if (removed || added) out.push({ removed, added });
    if (pa < a.length) {
      const last = out[out.length - 1];
      if (last && isKept(last)) last.kept += a[pa];
      else out.push({ kept: a[pa] });
    }
    i = pa + 1;
    j = pb + 1;
  }
  return out;
}

function bridge(all: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (let k = 0; k < all.length; k++) {
    const segment = all[k];
    const last = out[out.length - 1];
    const next = all[k + 1];
    if (isKept(segment) && SPACE.test(segment.kept) && isReplacement(last) && isReplacement(next)) {
      last.removed += segment.kept + next.removed;
      last.added += segment.kept + next.added;
      k++;
    } else {
      out.push({ ...segment });
    }
  }
  return out;
}

export function mergeWords(before: string, after: string): Edit[] {
  return bridge(segments(before, after)).flatMap((segment): Edit[] => {
    if (isKept(segment)) return [{ text: segment.kept, kind: "same" }];
    const edits: Edit[] = [];
    if (segment.removed) edits.push({ text: segment.removed, kind: "removed" });
    if (segment.added) edits.push({ text: segment.added, kind: "added" });
    return edits;
  });
}
