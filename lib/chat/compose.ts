/**
 * How long the assistant appears to be composing.
 *
 * The reply is computed synchronously by a keyword matcher, so without a delay
 * it arrived in the same frame as the question — and an answer that appears with
 * no gap at all is the single clearest tell that nothing is really thinking.
 *
 * Scaled by length so a one-line answer is not held back as long as a
 * paragraph, and capped so nobody is ever left waiting on a demo.
 *
 * Its own module rather than a constant inside the hook so the numbers can be
 * read and adjusted without opening the state machine that uses them.
 */

const THINK_MS = 350;
const PER_CHAR_MS = 6;
const MAX_MS = 1200;

export function composeDelay(reply: string): number {
  return Math.min(THINK_MS + reply.length * PER_CHAR_MS, MAX_MS);
}
