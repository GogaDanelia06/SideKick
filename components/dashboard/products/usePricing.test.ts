import { describe, it, expect } from "vitest";
import { num, pctFromSale, saleFromPct } from "./usePricing";

/**
 * The arithmetic only. Wiring it to three inputs is the hook's job and is
 * checked in the browser; what belongs here is the sums a merchant would
 * otherwise be doing in their head while pricing a product.
 */
describe("saleFromPct()", () => {
  it("takes a percentage off the price", () => {
    expect(saleFromPct(25000, 10)).toBe("22500");
  });

  it("rounds, because the column is an integer", () => {
    expect(saleFromPct(999, 33)).toBe("669");
  });

  it("gives the price back at zero percent", () => {
    expect(saleFromPct(25000, 0)).toBe("25000");
  });

  it("gives nothing back at a hundred percent", () => {
    expect(saleFromPct(25000, 100)).toBe("0");
  });
});

describe("pctFromSale()", () => {
  it("reads the discount out of a sale price", () => {
    expect(pctFromSale(25000, 22500)).toBe("10");
  });

  it("is the inverse of saleFromPct", () => {
    expect(pctFromSale(25000, Number(saleFromPct(25000, 35)))).toBe("35");
  });

  it("is zero when the sale price is the price", () => {
    expect(pctFromSale(3500, 3500)).toBe("0");
  });
});

describe("num()", () => {
  it("treats an empty box as no value rather than as zero", () => {
    // The difference matters: zero is a real discount, blank is "not set", and
    // reading blank as zero would stamp a 0% discount on every product.
    expect(num("")).toBeNull();
    expect(num("   ")).toBeNull();
    expect(num("0")).toBe(0);
  });

  it("refuses what is not a number", () => {
    expect(num("abc")).toBeNull();
  });
});
