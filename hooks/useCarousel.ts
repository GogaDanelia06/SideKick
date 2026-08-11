"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * How long a slide takes to travel, in milliseconds.
 *
 * Exported so the track's CSS and the safety net below cannot drift apart —
 * a duration in a class name and a timeout in a hook would eventually disagree.
 */
export const SLIDE_MS = 500;

/**
 * Drives a carousel whose slides sit side by side on a sliding track.
 *
 * The wrap is the whole reason this is more than a counter. Moving from the
 * last slide to the first by setting the index to 0 sends the track back across
 * every slide in between: the visitor asked to go forward and watched it rewind.
 *
 * So the track carries a copy of the first slide after the last, and a copy of
 * the last before the first. Going forward off the end lands on the copy —
 * which travels forward, because that is where the copy is — and once the
 * movement has finished the track jumps to the real slide with the transition
 * switched off. The jump covers identical pixels, so there is nothing to see.
 *
 * `position` is where the track sits, counting the copies. `index` is which
 * slide a reader would say they are on, which is what the dots need.
 */
export function useCarousel(count: number, intervalMs = 0) {
  const looped = count > 1;

  // Slot 0 holds the copy of the last slide, so the first real one is slot 1.
  const [position, setPosition] = useState(looped ? 1 : 0);
  /** True for the single commit that repositions the track, to hide the jump. */
  const [snapping, setSnapping] = useState(false);

  const index = looped ? (((position - 1) % count) + count) % count : 0;

  const next = useCallback(() => setPosition((p) => p + 1), []);
  const prev = useCallback(() => setPosition((p) => p - 1), []);
  const goTo = useCallback(
    (i: number) => setPosition(looped ? (((i % count) + count) % count) + 1 : 0),
    [count, looped],
  );

  /**
   * Swaps a copy for the real slide once the movement onto it has finished.
   *
   * Called from the track's `transitionend`. Waiting for the event rather than a
   * timer means the exchange cannot happen while the slide is still travelling,
   * which would show as a stutter halfway across.
   */
  const settle = useCallback(() => {
    if (!looped) return;
    setPosition((p) => {
      if (p > count) {
        setSnapping(true);
        return 1;
      }
      if (p < 1) {
        setSnapping(true);
        return count;
      }
      return p;
    });
  }, [count, looped]);

  // Give the repositioned track one frame to paint before transitions come
  // back, otherwise the browser animates the jump we just went to lengths to
  // hide.
  useEffect(() => {
    if (!snapping) return;
    const id = requestAnimationFrame(() => setSnapping(false));
    return () => cancelAnimationFrame(id);
  }, [snapping]);

  /**
   * Settles the track even when no `transitionend` arrives.
   *
   * It does not always arrive: a visitor who has asked for reduced motion gets
   * no transition and therefore no event, and a browser suspends them for a
   * background tab. Left on a copy the carousel would keep counting upward and
   * slide away into empty space, so the event is treated as an optimisation
   * rather than the mechanism. `settle` ignores a position already in range,
   * so whichever fires second does nothing.
   */
  useEffect(() => {
    if (!looped || (position >= 1 && position <= count)) return;
    const id = setTimeout(settle, SLIDE_MS + 80);
    return () => clearTimeout(id);
  }, [looped, position, count, settle]);

  // `position` is in the dependency list so the countdown starts again on every
  // change, including the ones a visitor makes. Without it the timer kept the
  // schedule it was given on mount: pressing next four seconds into a five
  // second slide showed the chosen one for a second before the interval moved
  // it on anyway.
  useEffect(() => {
    if (intervalMs <= 0 || snapping) return;
    const id = setTimeout(next, intervalMs);
    return () => clearTimeout(id);
  }, [intervalMs, position, snapping, next]);

  return { index, position, snapping, looped, goTo, next, prev, settle };
}
