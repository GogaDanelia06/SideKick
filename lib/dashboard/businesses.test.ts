import { describe, it, expect } from "vitest";
import { cleanBusinessName, sameBusinessName } from "./businesses";

describe("business names", () => {
  it("are stored trimmed, with single spaces", () => {
    expect(cleanBusinessName("  Flower \t  shop ")).toBe("Flower shop");
  });

  it("count as the same whatever the case or spacing", () => {
    expect(sameBusinessName("test", " TEST ")).toBe(true);
    expect(sameBusinessName("Flower shop", "flower   shop")).toBe(true);
    expect(sameBusinessName("დემო ბიზნესი", "დემო  ბიზნესი")).toBe(true);
    expect(sameBusinessName("test", "test 2")).toBe(false);
  });
});
