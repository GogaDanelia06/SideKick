"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { LiveDot, LiveFigure } from "./LiveFigure";
import type { HeroStatView } from "@/lib/site/content";

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Thousands separators, and at most one decimal so the width stays stable. */
function format(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function Frame({ value, label, live }: { value: React.ReactNode; label: string; live?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[22px] font-medium tabular-nums">{value}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
        {label}
        {live ? <LiveDot /> : null}
      </div>
    </div>
  );
}

/**
 * A figure that drifts upward to make the hero panel feel busy.
 *
 * This is the fallback for a figure with no counter behind it: it starts at the
 * admin's base value and adds a random amount from their range at a random
 * interval from their range. It is decoration, and it is the reason the source
 * picker exists — anything a visitor might read as a measurement should be
 * counted, not drifted.
 *
 * Honours `prefers-reduced-motion`: the number simply sits at its base value,
 * which is also what the server renders — so there is no hydration mismatch and
 * no motion for people who asked not to have any.
 */
function DriftStat({ stat }: { stat: HeroStatView }) {
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
    <Frame
      value={
        <>
          {format(value)}
          {stat.suffix}
        </>
      }
      label={t(stat.label)}
    />
  );
}

/** The same slot, filled with a figure the platform actually counted. */
function CountedStat({ stat }: { stat: HeroStatView }) {
  const { t } = useLanguage();
  return (
    <Frame
      live
      value={
        <LiveFigure
          source={stat.source}
          initial={stat.baseValue}
          format={stat.format}
          suffix={stat.suffix}
        />
      }
      label={t(stat.label)}
    />
  );
}

export function AnimatedStat({ stat }: { stat: HeroStatView }) {
  return stat.source ? <CountedStat stat={stat} /> : <DriftStat stat={stat} />;
}
