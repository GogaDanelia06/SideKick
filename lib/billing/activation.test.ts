import { describe, it, expect } from "vitest";
import { isActivated } from "./activation";

const NOW = new Date("2026-10-31T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const at = (days: number) => new Date(NOW.getTime() + days * DAY);

describe("isActivated()", () => {
  it("locks a business with no plan or one awaiting payment", () => {
    expect(isActivated(null, NOW)).toBe(false);
    expect(isActivated({ status: "PENDING", renewsAt: at(30) }, NOW)).toBe(false);
  });

  it("lets active, trial and past-due businesses in", () => {
    for (const status of ["ACTIVE", "TRIAL", "PAST_DUE"] as const) {
      expect(isActivated({ status, renewsAt: null }, NOW)).toBe(true);
    }
  });

  it("keeps a cancelled plan working only until its paid-until date", () => {
    expect(isActivated({ status: "CANCELLED", renewsAt: at(5) }, NOW)).toBe(true);
    expect(isActivated({ status: "CANCELLED", renewsAt: at(-1) }, NOW)).toBe(false);
    expect(isActivated({ status: "CANCELLED", renewsAt: null }, NOW)).toBe(false);
  });

  it("reads a paid-until date that arrived as text", () => {
    expect(isActivated({ status: "CANCELLED", renewsAt: at(5).toISOString() }, NOW)).toBe(true);
  });
});
