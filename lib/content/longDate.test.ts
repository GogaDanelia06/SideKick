import { describe, it, expect } from "vitest";
import { longDate } from "./longDate";

describe("longDate()", () => {
  it("writes the month out in each language", () => {
    expect(longDate("2026-07-22", "ka")).toBe("22 ივლისი, 2026");
    expect(longDate("2026-07-22", "en")).toBe("22 July 2026");
  });

  it("reads a date in the shop's own timezone, not the reader's", () => {
    // Late evening in London is already the next day in Tbilisi.
    expect(longDate("2026-01-31T21:30:00Z", "en")).toBe("1 February 2026");
  });

  it("says nothing about a date it cannot read", () => {
    expect(longDate("not a date", "ka")).toBe("");
  });
});
