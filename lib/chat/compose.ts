/** Simulated typing delay for the demo bot, scaled by reply length and capped. */

const THINK_MS = 350;
const PER_CHAR_MS = 6;
const MAX_MS = 1200;

export function composeDelay(reply: string): number {
  return Math.min(THINK_MS + reply.length * PER_CHAR_MS, MAX_MS);
}
