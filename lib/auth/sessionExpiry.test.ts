import { describe, expect, it } from "vitest";
import { UNREMEMBERED_MAX_SEC, sessionIsStale } from "./sessionExpiry";

const NOW = 1_800_000_000_000;
const agoSec = (s: number) => NOW - s * 1000;

describe("sessionIsStale", () => {
  it("keeps a fresh session", () => {
    expect(sessionIsStale({ startedAt: agoSec(60) }, NOW)).toBe(false);
  });

  it("expires one past the cap", () => {
    expect(sessionIsStale({ startedAt: agoSec(UNREMEMBERED_MAX_SEC + 1) }, NOW)).toBe(true);
  });

  it("keeps one exactly on the cap", () => {
    expect(sessionIsStale({ startedAt: agoSec(UNREMEMBERED_MAX_SEC) }, NOW)).toBe(false);
  });

  /** A remembered session keeps the full lifetime of its token. */
  it("never expires a remembered session", () => {
    expect(
      sessionIsStale({ remember: true, startedAt: agoSec(UNREMEMBERED_MAX_SEC * 100) }, NOW),
    ).toBe(false);
  });

  /**
   * Tokens issued before this check existed have no stamp. Expiring them would
   * sign out everyone online the moment it shipped — including remembered users.
   */
  it("leaves a token with no stamp alone", () => {
    expect(sessionIsStale({}, NOW)).toBe(false);
    expect(sessionIsStale({ remember: false }, NOW)).toBe(false);
  });

  it("ignores a stamp in the future rather than expiring it", () => {
    expect(sessionIsStale({ startedAt: NOW + 60_000 }, NOW)).toBe(false);
  });
});
