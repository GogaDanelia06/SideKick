/** Beyond this many table cells, the middle of two lists is simply called different. */
const MAX_CELLS = 1_000_000;

type Same<T> = (x: T, y: T) => boolean;

/** The part of two lists that no start or end in common can explain, matched up in order. */
function middle<T>(a: readonly T[], b: readonly T[], head: number, tail: number, same: Same<T>): [number, number][] {
  const n = a.length - head - tail;
  const m = b.length - head - tail;
  if (n === 0 || m === 0 || n * m > MAX_CELLS) return [];

  // share[i * width + j]: how many items a[i..] and b[j..] have in common, in order.
  const width = m + 1;
  const share = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      share[i * width + j] = same(a[head + i], b[head + j])
        ? share[(i + 1) * width + j + 1] + 1
        : Math.max(share[(i + 1) * width + j], share[i * width + j + 1]);
    }
  }

  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (same(a[head + i], b[head + j])) pairs.push([head + i++, head + j++]);
    else if (share[(i + 1) * width + j] >= share[i * width + j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * The longest run of items two lists have in common, in order, as pairs of positions.
 * What both start and end with is taken first, so a small edit in a long text stays cheap.
 */
export function commonRun<T>(a: readonly T[], b: readonly T[], same: Same<T> = Object.is): [number, number][] {
  let head = 0;
  while (head < a.length && head < b.length && same(a[head], b[head])) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && same(a[a.length - 1 - tail], b[b.length - 1 - tail])) tail++;

  const pairs: [number, number][] = [];
  for (let i = 0; i < head; i++) pairs.push([i, i]);
  pairs.push(...middle(a, b, head, tail, same));
  for (let k = tail; k > 0; k--) pairs.push([a.length - k, b.length - k]);
  return pairs;
}
