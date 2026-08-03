import { describe, expect, it } from "vitest";
import { formatStat } from "./statFormat";

/**
 * These figures are rewritten on every animation frame while a counter climbs,
 * so the rules that keep them readable — no decimals, a stable width, the same
 * shape server-side and client-side — are worth pinning down.
 */
describe("formatStat", () => {
  it("groups thousands", () => {
    expect(formatStat(1234, "number")).toBe("1,234");
    expect(formatStat(1234567, "number")).toBe("1,234,567");
  });

  it("never shows a fraction mid-tween", () => {
    expect(formatStat(1234.6, "number")).toBe("1,235");
    expect(formatStat(0.4, "number")).toBe("0");
  });

  it("shortens money so the hero panel does not reflow", () => {
    expect(formatStat(999, "money")).toBe("999₾");
    expect(formatStat(1000, "money")).toBe("1K₾");
    expect(formatStat(2450, "money")).toBe("2K₾");
    expect(formatStat(1_000_000, "money")).toBe("1M₾");
    expect(formatStat(2_400_000, "money")).toBe("2.4M₾");
  });

  it("handles an empty platform without printing junk", () => {
    expect(formatStat(0, "number")).toBe("0");
    expect(formatStat(0, "money")).toBe("0₾");
  });
});
