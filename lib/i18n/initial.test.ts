import { describe, it, expect } from "vitest";
import { initialOf } from "./initial";

describe("initialOf()", () => {
  it("capitalises Latin but leaves Georgian in its everyday form", () => {
    expect(initialOf("flower shop")).toBe("F");
    expect(initialOf("  დემო ბიზნესი")).toBe("დ");
    expect("დ".toUpperCase()).not.toBe("დ"); // what it guards against: Mtavruli "Დ"
  });

  it("falls back for an empty name and keeps a whole emoji", () => {
    expect(initialOf("   ")).toBe("?");
    expect(initialOf("", "—")).toBe("—");
    expect(initialOf("🌸 Shop")).toBe("🌸");
  });
});
