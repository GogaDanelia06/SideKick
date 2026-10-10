import { cache } from "react";
import { log } from "@/lib/logger";
import { formatStat, type StatSourceOption } from "../statFormat";
import { STAT_SOURCES, type StatSource } from "./definitions";

export function findStatSource(key: string): StatSource | undefined {
  return STAT_SOURCES.find((s) => s.key === key);
}

export const STAT_SOURCE_KEYS: string[] = STAT_SOURCES.map((s) => s.key);

export async function countStat(source: StatSource): Promise<number | null> {
  try {
    return await source.count();
  } catch (err) {
    log.error("live stat could not be counted", err, { source: source.key });
    return null;
  }
}

export const statSourceOptions = cache(async (): Promise<StatSourceOption[]> => {
  return Promise.all(
    STAT_SOURCES.map(async (s) => {
      const n = await countStat(s);
      return {
        key: s.key,
        label: s.label,
        format: s.format,
        value: n === null ? "—" : formatStat(n, s.format),
      };
    }),
  );
});

export { STAT_SOURCES, type StatSource } from "./definitions";
