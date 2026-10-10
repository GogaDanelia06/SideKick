import type { SiteStat } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

export const SMALL = "h-9 w-full rounded-[8px] border border-input bg-canvas px-2.5 text-[13px] outline-none focus:border-blue";
export const FIELD_LABEL = "mb-1 block text-[10px] uppercase tracking-wide text-faint";

export type Mode = "MANUAL" | "LIVE" | "AUTO";

export type Fields = {
  mode: Mode;
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
};

export const MODES: { key: Mode; label: Text; hint: Text }[] = [
  {
    key: "MANUAL",
    label: "admin.stats.editor.byHand",
    hint: "admin.stats.editor.hint",
  },
  {
    key: "AUTO",
    label: "admin.stats.editor.automaticGrowth",
    hint: "admin.stats.editor.hint2",
  },
  {
    key: "LIVE",
    label: "admin.stats.editor.liveCounter",
    hint: "admin.stats.editor.hint3",
  },
];

export function fieldsOf(s: SiteStat): Fields {
  return {
    mode: s.mode,
    value: s.value,
    source: s.source,
    labelKa: s.labelKa,
    labelEn: s.labelEn,
    suffix: s.suffix,
    baseValue: s.baseValue,
    changeMin: s.changeMin,
    changeMax: s.changeMax,
    intervalMinMs: s.intervalMinMs,
    intervalMaxMs: s.intervalMaxMs,
  };
}
