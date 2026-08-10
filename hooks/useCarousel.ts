"use client";

import { useCallback, useEffect, useState } from "react";

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
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearTimeout(id);
  }, [count, intervalMs, index]);

  return { index, goTo, next, prev };
}
