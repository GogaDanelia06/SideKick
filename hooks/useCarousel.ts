"use client";

import { useCallback, useEffect, useState } from "react";

/** Index state + auto-advance for a wrap-around carousel. */
export function useCarousel(count: number, intervalMs = 0) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (intervalMs <= 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  return { index, goTo, next, prev };
}
