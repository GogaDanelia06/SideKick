import { prisma } from "@/lib/db";

/**
 * A figure that climbs on its own.
 *
 * The landing-page spec asks for three settings per figure — a start value, a
 * range for how much it changes and a range for how often — with the random
 * draws coming from an endpoint rather than the browser. That last part is the
 * one that matters: dice rolled in each visitor's browser mean two people see
 * two different numbers, and a refresh sends the figure back to its start
 * value. Both of those are how a visitor works out the number is invented.
 *
 * So the draw happens here, the running value lives in the database, and every
 * visitor reads the same figure.
 */

export type AutoConfig = {
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
};

export type AutoState = { value: number; nextAt: Date };

/**
 * How many missed steps get applied in one read.
 *
 * A figure nobody has looked at for a month should catch up rather than sit
 * frozen, but not by spinning through a hundred thousand iterations to do it.
 */
const MAX_CATCHUP = 500;

/** Smallest interval we will honour, so a zero range cannot spin forever. */
const MIN_INTERVAL_MS = 1_000;

export type Random = () => number;

export function between(min: number, max: number, random: Random = Math.random): number {
  if (max <= min) return min;
  return min + random() * (max - min);
}

function nextInterval(config: AutoConfig, random: Random): number {
  return Math.max(MIN_INTERVAL_MS, between(config.intervalMinMs, config.intervalMaxMs, random));
}

/**
 * Works out what a figure should read now, and when it next changes.
 *
 * Pure — the caller decides whether to persist the result. `random` is a
 * parameter so the behaviour can be pinned down in a test rather than observed
 * and hoped for.
 */
export function advance(
  config: AutoConfig,
  state: AutoState | null,
  now: Date,
  random: Random = Math.random,
): AutoState {
  if (!state) {
    return {
      value: config.baseValue,
      nextAt: new Date(now.getTime() + nextInterval(config, random)),
    };
  }

  let { value } = state;
  let nextAt = state.nextAt;

  for (let step = 0; step < MAX_CATCHUP && nextAt.getTime() <= now.getTime(); step++) {
    value += between(config.changeMin, config.changeMax, random);
    nextAt = new Date(nextAt.getTime() + nextInterval(config, random));
  }

  // Hitting the cap leaves a schedule still in the past; move it forward so the
  // next read does not immediately grind through another 500 steps.
  if (nextAt.getTime() <= now.getTime()) {
    nextAt = new Date(now.getTime() + nextInterval(config, random));
  }

  return { value, nextAt };
}

export type AutoRow = AutoConfig & {
  id: string;
  autoValue: number | null;
  autoNextAt: Date | null;
};

/**
 * Reads a drifting figure, advancing and saving it if it is due.
 *
 * The write is guarded on the schedule we read, so two visitors arriving at the
 * same moment cannot both apply a step. The loser simply keeps the value it
 * computed, which is within one increment of the winner's — close enough for a
 * decorative figure, and not worth a transaction.
 */
export async function readAutoStat(row: AutoRow, now = new Date()): Promise<number> {
  const state =
    row.autoValue !== null && row.autoNextAt !== null
      ? { value: row.autoValue, nextAt: row.autoNextAt }
      : null;

  const next = advance(row, state, now);

  const unchanged =
    state !== null &&
    state.value === next.value &&
    state.nextAt.getTime() === next.nextAt.getTime();

  if (!unchanged) {
    await prisma.siteStat.updateMany({
      where: { id: row.id, autoNextAt: row.autoNextAt },
      data: { autoValue: next.value, autoNextAt: next.nextAt },
    });
  }

  return next.value;
}

/**
 * The key a drifting figure is published under.
 *
 * Prefixed so it cannot collide with a counter key from STAT_SOURCES — both
 * kinds share one payload and one poller on the client.
 */
export function autoKey(statKey: string): string {
  return `auto:${statKey}`;
}
