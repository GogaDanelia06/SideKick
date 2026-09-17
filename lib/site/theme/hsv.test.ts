import { describe, it, expect } from "vitest";
import { hexToHsv, hsvToHex } from "./hsv";

describe("hexToHsv() / hsvToHex()", () => {
  it("reads the primaries and the extremes", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv("#00ff00")).toEqual({ h: 120, s: 1, v: 1 });
    expect(hexToHsv("#0000ff")).toEqual({ h: 240, s: 1, v: 1 });
    expect(hexToHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 1 });
  });

  it("gives every colour back unchanged after a round trip", () => {
    for (const hex of ["#a371f7", "#8250df", "#0d1117", "#f6f8fa", "#238636", "#f85149", "#0ea5e9", "#808080"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it("writes lowercase six-digit hex, even at the edges of the hue circle", () => {
    expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe("#ff0000");
    expect(hsvToHex({ h: 200, s: 0, v: 0.5 })).toBe("#808080");
  });
});
