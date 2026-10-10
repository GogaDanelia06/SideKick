"use client";

import { useCallback, useEffect, useState } from "react";

export const SLIDE_MS = 500;

export function useCarousel(count: number, intervalMs = 0) {
  const looped = count > 1;

  const [position, setPosition] = useState(looped ? 1 : 0);
  const [snapping, setSnapping] = useState(false);

  const index = looped ? (((position - 1) % count) + count) % count : 0;

  const next = useCallback(() => setPosition((p) => p + 1), []);
  const prev = useCallback(() => setPosition((p) => p - 1), []);
  const goTo = useCallback(
    (i: number) => setPosition(looped ? (((i % count) + count) % count) + 1 : 0),
    [count, looped],
  );

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

  useEffect(() => {
    if (!snapping) return;
    const id = requestAnimationFrame(() => setSnapping(false));
    return () => cancelAnimationFrame(id);
  }, [snapping]);

  useEffect(() => {
    if (!looped || (position >= 1 && position <= count)) return;
    const id = setTimeout(settle, SLIDE_MS + 80);
    return () => clearTimeout(id);
  }, [looped, position, count, settle]);

  useEffect(() => {
    if (intervalMs <= 0 || snapping) return;
    const id = setTimeout(next, intervalMs);
    return () => clearTimeout(id);
  }, [intervalMs, position, snapping, next]);

  return { index, position, snapping, looped, goTo, next, prev, settle };
}
