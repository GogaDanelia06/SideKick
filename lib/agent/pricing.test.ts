import { describe, expect, it } from "vitest";
import { effectivePrice, priceLines, type PricedProduct } from "./pricing";

const CATALOGUE: PricedProduct[] = [
  { id: "p1", code: "DR-014", name: "თეთრი კაბა", price: 189, salePrice: 159 },
  { id: "p2", code: "PH-201", name: "iPhone 15 Pro", price: 3500, salePrice: null },
  { id: "p3", code: "ZZ-000", name: "Zero sale price", price: 100, salePrice: 0 },
];

describe("effectivePrice", () => {
  it("prefers a real sale price", () => {
    expect(effectivePrice({ price: 189, salePrice: 159 })).toBe(159);
  });

  it("falls back to the list price when there is no sale", () => {
    expect(effectivePrice({ price: 3500, salePrice: null })).toBe(3500);
  });

  it("treats a zero sale price as no sale, not as free", () => {
    expect(effectivePrice({ price: 100, salePrice: 0 })).toBe(100);
  });
});

/**
 * The AI service never sends a price. These cases are what stops a wrong one
 * from getting in anyway — through a bad code, a nonsense quantity, or an empty
 * order that would otherwise book as 0₾.
 */
describe("priceLines", () => {
  it("prices from the catalogue, not from the caller", () => {
    const result = priceLines([{ code: "DR-014", qty: 2 }], CATALOGUE);
    expect(result).toEqual({
      items: [
        {
          productId: "p1",
          codeSnapshot: "DR-014",
          nameSnapshot: "თეთრი კაბა",
          qty: 2,
          price: 159,
          lineTotal: 318,
        },
      ],
      total: 318,
    });
  });

  it("adds lines up across products", () => {
    const result = priceLines(
      [
        { code: "DR-014", qty: 1 },
        { code: "PH-201", qty: 2 },
      ],
      CATALOGUE,
    );
    expect("total" in result && result.total).toBe(159 + 7000);
  });

  it("snapshots name and code so a later rename cannot rewrite history", () => {
    const result = priceLines([{ code: "PH-201", qty: 1 }], CATALOGUE);
    expect("items" in result && result.items[0]!.nameSnapshot).toBe("iPhone 15 Pro");
  });

  it("refuses a code this business does not have", () => {
    expect(priceLines([{ code: "NOPE-1", qty: 1 }], CATALOGUE)).toEqual({
      error: 'no product with code "NOPE-1" for this business',
    });
  });

  it("refuses quantities that are not whole and positive", () => {
    expect(priceLines([{ code: "DR-014", qty: 0 }], CATALOGUE)).toHaveProperty("error");
    expect(priceLines([{ code: "DR-014", qty: -3 }], CATALOGUE)).toHaveProperty("error");
    expect(priceLines([{ code: "DR-014", qty: 1.5 }], CATALOGUE)).toHaveProperty("error");
  });

  it("refuses an empty order rather than booking one worth nothing", () => {
    expect(priceLines([], CATALOGUE)).toEqual({
      error: "items must contain at least one line",
    });
  });

  it("prices an out-of-catalogue lookup miss before touching the rest", () => {
    const result = priceLines(
      [
        { code: "DR-014", qty: 1 },
        { code: "GONE", qty: 1 },
      ],
      CATALOGUE,
    );
    expect(result).toHaveProperty("error");
  });
});
