"use client";

import { useCallback, useEffect, useState } from "react";

/** Slide transition duration, shared with the track's CSS. */
export const SLIDE_MS = 500;

/**
 * Carousel on a sliding track with clones at both ends, so wrapping keeps moving
 * forward; after landing on a clone the track snaps to the real slide invisibly.
 * `position` counts clones; `index` is the real slide.
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

  /** Swaps a clone for the real slide once the transition ends (called on `transitionend`). */
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

  // Re-enable transitions a frame after the snap, so the jump is not animated.
  useEffect(() => {
    if (!snapping) return;
    const id = requestAnimationFrame(() => setSnapping(false));
    return () => cancelAnimationFrame(id);
  }, [snapping]);

  /** Fallback for when no `transitionend` fires (reduced motion, background tabs). */
  useEffect(() => {
    if (!looped || (position >= 1 && position <= count)) return;
    const id = setTimeout(settle, SLIDE_MS + 80);
    return () => clearTimeout(id);
  }, [looped, position, count, settle]);

  // Restart the auto-advance timer after every move, including manual ones.
  useEffect(() => {
    if (intervalMs <= 0 || snapping) return;
    const id = setTimeout(next, intervalMs);
    return () => clearTimeout(id);
  }, [intervalMs, position, snapping, next]);

  return { index, position, snapping, looped, goTo, next, prev, settle };
}
