import { describe, expect, it } from "vitest";
import { advance, autoKey, between, type AutoConfig } from "./autoStat";

/** Always returns the midpoint, so every draw is predictable. */
const mid = () => 0.5;

const CONFIG: AutoConfig = {
  baseValue: 1000,
  changeMin: 2,
  changeMax: 4,
  intervalMinMs: 60_000,
  intervalMaxMs: 60_000,
};

const T0 = new Date("2026-08-03T12:00:00.000Z");
const at = (msFromT0: number) => new Date(T0.getTime() + msFromT0);

describe("between", () => {
  it("returns the midpoint for a midpoint draw", () => {
    expect(between(10, 20, mid)).toBe(15);
  });

  it("collapses an inverted or empty range to its floor", () => {
    expect(between(10, 10, mid)).toBe(10);
    expect(between(20, 10, mid)).toBe(20);
  });
});

describe("advance", () => {
  it("starts a fresh figure at its start value", () => {
    const next = advance(CONFIG, null, T0, mid);
    expect(next.value).toBe(1000);
    expect(next.nextAt).toEqual(at(60_000));
  });

  it("leaves a figure alone before its next change is due", () => {
    const state = { value: 1000, nextAt: at(60_000) };
    const next = advance(CONFIG, state, at(30_000), mid);
    expect(next.value).toBe(1000);
    expect(next.nextAt).toEqual(state.nextAt);
  });

  it("applies one step when one is due", () => {
    const state = { value: 1000, nextAt: at(60_000) };
    const next = advance(CONFIG, state, at(60_000), mid);
    expect(next.value).toBe(1003);
    expect(next.nextAt).toEqual(at(120_000));
  });

  /**
   * The point of catching up: a landing page nobody visited overnight should
   * read as though it had been climbing all along, not as though time stopped.
   */
  it("catches up every step missed while nobody was looking", () => {
    const state = { value: 1000, nextAt: at(60_000) };
    const next = advance(CONFIG, state, at(60_000 * 10), mid);
    expect(next.value).toBe(1030);
    expect(next.nextAt.getTime()).toBeGreaterThan(at(60_000 * 10).getTime());
  });

  it("caps a very long absence instead of grinding through every step", () => {
    const state = { value: 1000, nextAt: at(60_000) };
    // A year of one-minute steps would be ~525,600 iterations.
    const next = advance(CONFIG, state, at(60_000 * 525_600), mid);
    expect(next.value).toBe(1000 + 500 * 3);
    // And the schedule is pulled forward, so the next read is not another 500.
    expect(next.nextAt.getTime()).toBeGreaterThan(at(60_000 * 525_600).getTime());
  });

  it("cannot spin forever on a zero interval range", () => {
    const zero: AutoConfig = { ...CONFIG, intervalMinMs: 0, intervalMaxMs: 0 };
    const next = advance(zero, { value: 0, nextAt: at(0) }, at(10_000), mid);
    expect(next.nextAt.getTime()).toBeGreaterThan(at(10_000).getTime());
  });

  it("only ever climbs when the change range is positive", () => {
    const state = { value: 1000, nextAt: at(60_000) };
    const next = advance(CONFIG, state, at(300_000), mid);
    expect(next.value).toBeGreaterThan(1000);
  });
});

describe("autoKey", () => {
  it("namespaces drifting figures away from counter keys", () => {
    // Both kinds share one payload, so a stat keyed "users" must not collide
    // with the "users" counter from STAT_SOURCES.
    expect(autoKey("users")).toBe("auto:users");
    expect(autoKey("users")).not.toBe("users");
  });
});
