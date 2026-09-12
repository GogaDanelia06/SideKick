import { prisma } from "@/lib/db";

/**
 * Decorative figures that climb over time. The random steps are drawn on the
 * server and stored, so every visitor sees the same number.
 */

export type AutoConfig = {
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
};

export type AutoState = { value: number; nextAt: Date };

/** Caps the catch-up steps applied in one read after a long idle period. */
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

/** Pure: the value now and the next change time. `random` is injectable for tests. */
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

  // Hitting the cap can leave the schedule in the past; restart it from now.
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
 * Advances and saves a figure when a step is due. The write is guarded on the
 * schedule that was read, so concurrent readers cannot both apply a step.
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

/** Prefixed so drifting keys never collide with counter keys in the live payload. */
export function autoKey(statKey: string): string {
  return `auto:${statKey}`;
}
