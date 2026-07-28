"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { HeroStatView } from "@/lib/site/content";

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Thousands separators, and at most one decimal so the width stays stable. */
function format(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * A figure that drifts upward to make the hero panel feel live.
 *
 * Starts at the admin's base value and adds a random amount from their range at
 * a random interval from their range. Randomness on both axes is what stops it
 * looking like a mechanical counter.
 *
 * Honours `prefers-reduced-motion`: the number simply sits at its base value,
 * which is also what the server renders — so there is no hydration mismatch and
 * no motion for people who asked not to have any.
 */
export function AnimatedStat({ stat }: { stat: HeroStatView }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(stat.baseValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (stat.changeMax === 0 && stat.changeMin === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setValue((v) => v + rand(stat.changeMin, stat.changeMax));
      timer = setTimeout(tick, rand(stat.intervalMinMs, stat.intervalMaxMs));
    };
    timer = setTimeout(tick, rand(stat.intervalMinMs, stat.intervalMaxMs));
    return () => clearTimeout(timer);
  }, [stat.changeMin, stat.changeMax, stat.intervalMinMs, stat.intervalMaxMs]);

  return (
    <div>
      <div className="font-mono text-[22px] font-medium tabular-nums">
        {format(value)}
        {stat.suffix}
      </div>
      <div className="mt-0.5 text-[11px] text-muted">{t(stat.label)}</div>
    </div>
  );
}
