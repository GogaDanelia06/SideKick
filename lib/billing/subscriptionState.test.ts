import { describe, it, expect } from "vitest";
import { GRACE_DAYS, graceEndsAt, inGrace, isExpired } from "./subscriptionState";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-09T12:00:00Z");
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);
const ahead = (days: number) => new Date(NOW.getTime() + days * DAY);

describe("isExpired()", () => {
  it("treats a subscription with no renewal date as live", () => {
    // Every trial and every hand-seeded row is in this state. Reading "was
    // never bought" as "has run out" would switch off every tenant the day
    // this shipped.
    expect(isExpired(null, NOW)).toBe(false);
    expect(isExpired(undefined, NOW)).toBe(false);
  });

  it("keeps a subscription inside its paid period", () => {
    expect(isExpired(ahead(10), NOW)).toBe(false);
  });

  it("keeps one that lapsed yesterday", () => {
    expect(isExpired(ago(1), NOW)).toBe(false);
  });

  it("keeps one right up to the end of the grace period", () => {
    expect(isExpired(ago(GRACE_DAYS), NOW)).toBe(false);
  });

  it("expires one an instant past the grace period", () => {
    expect(isExpired(new Date(ago(GRACE_DAYS).getTime() - 1), NOW)).toBe(true);
  });

  it("expires one abandoned months ago", () => {
    expect(isExpired(ago(120), NOW)).toBe(true);
  });
});

describe("inGrace()", () => {
  it("is false while the period is still running", () => {
    expect(inGrace(ahead(3), NOW)).toBe(false);
  });

  it("is true between the renewal date and the end of grace", () => {
    expect(inGrace(ago(1), NOW)).toBe(true);
    expect(inGrace(ago(GRACE_DAYS), NOW)).toBe(true);
  });

  it("is false once expired — the two states never overlap", () => {
    const lapsed = ago(GRACE_DAYS + 1);
    expect(inGrace(lapsed, NOW)).toBe(false);
    expect(isExpired(lapsed, NOW)).toBe(true);
  });

  it("is false with no renewal date", () => {
    expect(inGrace(null, NOW)).toBe(false);
  });
});

describe("graceEndsAt()", () => {
  it("is the renewal date plus the grace period", () => {
    expect(graceEndsAt(NOW).getTime()).toBe(NOW.getTime() + GRACE_DAYS * DAY);
  });
});
