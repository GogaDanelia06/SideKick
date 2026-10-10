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

function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const [reduced] = useState(prefersReducedMotion);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

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

export function LiveDot() {
  const { t } = useLanguage();
  return (
    <span
      title={t("home.liveFigure.liveFigure")}
      className="inline-flex size-[7px] shrink-0 rounded-full bg-green"
    >
      <span className="size-full animate-ping rounded-full bg-green opacity-75" />
    </span>
  );
}
