import { describe, it, expect } from "vitest";
import { derived, readableOn } from "./derive";
import { defaultColors } from "./tokens";

describe("readableOn()", () => {
  it("keeps white text on the shipped AI colours", () => {
    expect(readableOn(defaultColors("dark").ai)).toBe("#ffffff");
    expect(readableOn(defaultColors("light").ai)).toBe("#ffffff");
    expect(readableOn("#0d1117")).toBe("#ffffff");
  });

  it("switches to black where white would disappear", () => {
    expect(readableOn("#ffffff")).toBe("#000000");
    expect(readableOn("#c4b5fd")).toBe("#000000");
    expect(readableOn("#f0b429")).toBe("#000000");
  });
});

describe("derived()", () => {
  it("gives the dashboard a text colour for the AI accent", () => {
    const colors = { ...defaultColors("dark"), ai: "#ffffff" };
    expect(derived(colors, "dark").dash["--on-ai"]).toBe("#000000");
  });
});
