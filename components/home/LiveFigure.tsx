"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getLiveStat, subscribeLiveStats } from "@/lib/site/liveStats";
import { formatStat, type StatFormat } from "@/lib/site/statFormat";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TWEEN_MS = 900;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Counts from wherever the number is now to wherever it just moved to.
 *
 * Interrupting mid-flight is normal — a second signup can land while the first
 * is still counting — so the animation always restarts from the value on
 * screen rather than from the last target. Anything else would make the number
 * jump backwards before climbing again.
 */
function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  // Read once on mount. Server-side it is false, and the first render is the
  // target either way, so hydration sees the same number both times.
  const [reduced] = useState(prefersReducedMotion);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    // Nothing to animate: the render below shows the new figure outright.
    if (reduced) {
      fromRef.current = target;
      return;
    }

    let raf = 0;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / TWEEN_MS);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return reduced ? target : value;
}

/**
 * A real platform figure that keeps itself current.
 *
 * `initial` is what the server counted for this render, so the first paint is
 * already the truth and there is nothing to hydrate around. From then on the
 * shared poller supplies the number and this counts up to it.
 */
export function LiveFigure({
  source,
  initial,
  format,
  suffix = "",
  className,
}: {
  source: string;
  initial: number;
  format: StatFormat;
  suffix?: string;
  className?: string;
}) {
  const live = useSyncExternalStore(
    subscribeLiveStats,
    () => getLiveStat(source),
    () => undefined,
  );
  const value = useCountUp(live ?? initial);

  return (
    <span className={className}>
      {formatStat(value, format)}
      {suffix}
    </span>
  );
}

/** The "this is being counted right now" marker that sits beside a label. */
export function LiveDot() {
  const { t } = useLanguage();
  return (
    <span
      title={t({ ka: "ცოცხალი მონაცემი", en: "Live figure" })}
      className="inline-flex size-[7px] shrink-0 rounded-full bg-green"
    >
      <span className="size-full animate-ping rounded-full bg-green opacity-75" />
    </span>
  );
}
