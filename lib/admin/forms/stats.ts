import type { StatMode } from "@prisma/client";
import { STAT_SOURCE_KEYS } from "@/lib/site/statSources";
import { field, num, sortedPair, type Parsed } from "./fields";

export type StatData = {
  mode: StatMode;
  value: string;
  source: string;
  labelKa: string;
  labelEn: string;
  suffix: string;
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
  autoValue: number | null;
  autoNextAt: Date | null;
};

export type SlideStatData = Omit<StatData, "mode" | "value" | "autoValue" | "autoNextAt">;

/** Shortest drift interval an admin may set, so a figure cannot flicker. */
const MIN_INTERVAL_S = 5;

/** A strip figure is typed, counted or drifting; the other modes' fields are reset. */
export function parseSiteStat(fd: FormData): Parsed<StatData> {
  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!labelKa || !labelEn) return { error: "all_fields_required" };

  const mode = field(fd, "mode");
  if (mode !== "MANUAL" && mode !== "LIVE" && mode !== "AUTO") return { error: "bad_mode" };

  const blank = {
    labelKa,
    labelEn,
    suffix: field(fd, "suffix"),
    value: "",
    source: "",
    baseValue: 0,
    changeMin: 0,
    changeMax: 0,
    intervalMinMs: 60_000,
    intervalMaxMs: 300_000,
    // Reset the running value so a new start value takes effect.
    autoValue: null,
    autoNextAt: null,
  };

  if (mode === "LIVE") {
    const source = field(fd, "source");
    if (!source || !STAT_SOURCE_KEYS.includes(source)) return { error: "unknown_source" };
    return { data: { ...blank, mode, source } };
  }

  if (mode === "MANUAL") {
    const value = field(fd, "value");
    if (!value) return { error: "value_required" };
    return { data: { ...blank, mode, value } };
  }

  const [changeMin, changeMax] = sortedPair(num(fd, "changeMin", 0), num(fd, "changeMax", 0));
  const [minS, maxS] = sortedPair(
    Math.max(MIN_INTERVAL_S, num(fd, "intervalMinS", 60)),
    Math.max(MIN_INTERVAL_S, num(fd, "intervalMaxS", 300)),
  );
  return {
    data: {
      ...blank,
      mode,
      baseValue: num(fd, "baseValue", 0),
      changeMin,
      changeMax,
      intervalMinMs: minS * 1000,
      intervalMaxMs: maxS * 1000,
    },
  };
}

/** A slide figure is counted or drifting; a counted one zeroes its drift settings. */
export function parseSlideStat(fd: FormData): Parsed<SlideStatData> {
  const source = field(fd, "source");
  if (source && !STAT_SOURCE_KEYS.includes(source)) return { error: "unknown_source" };

  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!labelKa || !labelEn) return { error: "label_required" };

  const common = { labelKa, labelEn, source, suffix: field(fd, "suffix") };
  if (source) {
    return {
      data: { ...common, baseValue: 0, changeMin: 0, changeMax: 0, intervalMinMs: 2000, intervalMaxMs: 6000 },
    };
  }

  const [changeMin, changeMax] = sortedPair(num(fd, "changeMin", 0), num(fd, "changeMax", 0));
  const [intervalMinMs, intervalMaxMs] = sortedPair(
    Math.max(200, num(fd, "intervalMinMs", 2000)),
    Math.max(200, num(fd, "intervalMaxMs", 6000)),
  );
  return {
    data: { ...common, baseValue: num(fd, "baseValue", 0), changeMin, changeMax, intervalMinMs, intervalMaxMs },
  };
}
