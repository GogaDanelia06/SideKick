import { describe, it, expect } from "vitest";

/**
 * The wrap arithmetic, lifted out of the hook so it can be checked without a
 * renderer. These are the two lines that decide whether a visitor sees the
 * carousel continue or rewind, and they are easy to get subtly wrong.
 */

/** Where the track sits, counting the copy of the last slide in slot 0. */
const slotOf = (index: number, count: number) => (((index % count) + count) % count) + 1;

/** Which slide a reader would say they are looking at, from the track position. */
const indexOf = (position: number, count: number) =>
  (((position - 1) % count) + count) % count;

/** What the hook does when a movement onto a copy has finished. */
function settle(position: number, count: number) {
  if (position > count) return 1;
  if (position < 1) return count;
  return position;
}

const COUNT = 3;

describe("track slots", () => {
  it("puts the first real slide after the copy of the last", () => {
    expect(slotOf(0, COUNT)).toBe(1);
    expect(slotOf(1, COUNT)).toBe(2);
    expect(slotOf(2, COUNT)).toBe(3);
  });

  it("reads back the slide a reader is on", () => {
    expect(indexOf(1, COUNT)).toBe(0);
    expect(indexOf(3, COUNT)).toBe(2);
  });

  it("reads a copy as the slide it is a copy of", () => {
    // Slot 4 holds a second drawing of slide 0, and slot 0 of slide 2. The dots
    // must not flicker to some other slide while the track is parked on one.
    expect(indexOf(COUNT + 1, COUNT)).toBe(0);
    expect(indexOf(0, COUNT)).toBe(COUNT - 1);
  });
});

describe("running off the end", () => {
  it("goes forward onto the copy rather than back across the others", () => {
    // The bug this exists for: from the last slide, setting the index to 0
    // sends the track from slot 3 to slot 1 — backwards past slide 2 — when the
    // visitor asked to go forward. Forward means the number goes up.
    const fromLast = slotOf(2, COUNT);
    const afterNext = fromLast + 1;

    expect(afterNext).toBeGreaterThan(fromLast);
    expect(afterNext).toBe(COUNT + 1);
  });

  it("lands on the real first slide once the movement is over", () => {
    expect(settle(COUNT + 1, COUNT)).toBe(1);
    expect(indexOf(settle(COUNT + 1, COUNT), COUNT)).toBe(0);
  });

  it("goes backward off the front onto the copy of the last", () => {
    const fromFirst = slotOf(0, COUNT);
    const afterPrev = fromFirst - 1;

    expect(afterPrev).toBeLessThan(fromFirst);
    expect(afterPrev).toBe(0);
    expect(settle(afterPrev, COUNT)).toBe(COUNT);
    expect(indexOf(settle(afterPrev, COUNT), COUNT)).toBe(COUNT - 1);
  });

  it("leaves a position that is already on a real slide alone", () => {
    // `settle` runs from both a transitionend and a timeout, so whichever
    // arrives second must not move anything.
    for (let p = 1; p <= COUNT; p++) expect(settle(p, COUNT)).toBe(p);
  });

  it("keeps the copy showing the same picture as the slide it replaces", () => {
    const track = [COUNT - 1, ...Array.from({ length: COUNT }, (_, i) => i), 0];

    expect(track).toEqual([2, 0, 1, 2, 0]);
    // The swap at the end is invisible only because these two draw the same
    // slide; if they ever differ the carousel visibly flicks at the wrap.
    expect(track[COUNT + 1]).toBe(track[1]);
    expect(track[0]).toBe(track[COUNT]);
  });
});
