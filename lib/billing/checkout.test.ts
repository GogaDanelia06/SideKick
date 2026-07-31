import { describe, it, expect } from "vitest";
import type { Plan } from "@prisma/client";
import { amountFor, isAllowedMonths } from "./checkout";

function plan(over: Partial<Plan> = {}): Plan {
  return {
    id: "p1",
    key: "standard",
    name: "სტანდარტი",
    nameEn: "Standard",
    price: 99,
    price3m: null,
    price12m: null,
    msgLimit: 10000,
    channelCap: 3,
    userCap: 5,
    productCap: 1000,
    extrasKa: [],
    extrasEn: [],
    featured: true,
    ...over,
  } as Plan;
}

describe("isAllowedMonths", () => {
  it.each([1, 3, 12])("allows %i months", (m) => {
    expect(isAllowedMonths(m)).toBe(true);
  });

  it.each([0, -1, 2, 6, 24, 1.5, NaN])("rejects %s", (m) => {
    expect(isAllowedMonths(m)).toBe(false);
  });
});

describe("amountFor", () => {
  it("charges the monthly price for one month", () => {
    expect(amountFor(plan(), 1)).toBe(99);
  });

  it("multiplies when no term price is configured", () => {
    expect(amountFor(plan(), 3)).toBe(297);
    expect(amountFor(plan(), 12)).toBe(1188);
  });

  it("prefers the configured term price over the multiple", () => {
    expect(amountFor(plan({ price3m: 249 }), 3)).toBe(249);
    expect(amountFor(plan({ price12m: 990 }), 12)).toBe(990);
  });

  it("uses a term price of zero rather than falling back", () => {
    expect(amountFor(plan({ price12m: 0 }), 12)).toBe(0);
  });

  it("does not let a 3-month price leak into the 12-month total", () => {
    expect(amountFor(plan({ price3m: 249 }), 12)).toBe(1188);
  });
});
