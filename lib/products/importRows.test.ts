import { describe, it, expect } from "vitest";
import { checkRow, isImportRow, readNumber } from "./importRow";
import { MAX_IMPORT_ROWS, tableToRows } from "./importRows";

describe("readNumber()", () => {
  it.each([
    ["159", 159],
    ["1 200", 1200],
    ["1,200.50", 1200.5],
    ["1.200,50", 1200.5],
    ["12,5", 12.5],
    ["₾15", 15],
  ])("reads %s", (raw, value) => {
    expect(readNumber(raw)).toBe(value);
  });

  it("tells empty apart from not a number", () => {
    expect(readNumber("  ")).toBeUndefined();
    expect(readNumber("abc")).toBeNull();
    expect(readNumber("#N/A")).toBeNull();
  });
});

describe("checkRow()", () => {
  const base = { code: "A-1", name: "Dress", price: "100" };

  it("works out the sale price from a discount, and the discount from a sale price", () => {
    expect(checkRow({ ...base, discountPct: "10" })).toEqual({
      row: { code: "A-1", name: "Dress", price: 100, discountPct: 10, salePrice: 90 },
    });
    expect(checkRow({ ...base, salePrice: "75" })).toEqual({
      row: { code: "A-1", name: "Dress", price: 100, discountPct: 25, salePrice: 75 },
    });
  });

  it("leaves blank optional cells out, so they keep the current value", () => {
    expect(checkRow({ ...base, quantity: "", size: " ", description: "" })).toEqual({
      row: { code: "A-1", name: "Dress", price: 100 },
    });
  });

  it.each([
    [{ ...base, code: " " }, "code"],
    [{ ...base, name: "" }, "name"],
    [{ ...base, price: "free" }, "price"],
    [{ ...base, price: "" }, "price"],
    [{ ...base, discountPct: "120" }, "discount"],
    [{ ...base, salePrice: "150" }, "sale"],
    [{ ...base, quantity: "2.5" }, "quantity"],
    [{ ...base, quantity: "-1" }, "quantity"],
    [{ ...base, name: "x".repeat(201) }, "too_long"],
  ])("refuses %o (%s)", (cells, problem) => {
    expect(checkRow(cells)).toEqual({ problem });
  });

  it("gives the server a check of its own", () => {
    expect(isImportRow({ code: "A-1", name: "Dress", price: 100, salePrice: 90, discountPct: 10 })).toBe(true);
    expect(isImportRow({ code: "A-1", name: "Dress", price: 100, salePrice: 120 })).toBe(false);
    expect(isImportRow({ code: "A-1", name: "Dress", price: 1.5 })).toBe(false);
    expect(isImportRow({ code: "", name: "Dress", price: 1 })).toBe(false);
    expect(isImportRow(null)).toBe(false);
  });
});

describe("tableToRows()", () => {
  it("reads Georgian, English and alias headers, in any order, ignoring unknown columns", () => {
    const parsed = tableToRows([
      ["Price", "notes", "კოდი", "SKU", "დასახელება", "მარაგი"],
      ["10", "x", "A-1", "ignored", "Hat", "3"],
    ]);
    expect(parsed).toEqual({ ok: true, rows: [{ code: "A-1", name: "Hat", price: 10, quantity: 3 }], errors: [] });
  });

  it("names the spreadsheet row of every problem, including repeated codes", () => {
    const parsed = tableToRows([
      ["code", "name", "price"],
      ["A-1", "Hat", "10"],
      ["", "", ""],
      ["A-2", "", "10"],
      ["A-1", "Cap", "12"],
    ]);
    expect(parsed).toEqual({
      ok: true,
      rows: [{ code: "A-1", name: "Hat", price: 10 }],
      errors: [
        { line: 4, problem: "name" },
        { line: 5, problem: "duplicate", other: 2 },
      ],
    });
  });

  it("refuses files it cannot use", () => {
    expect(tableToRows([["code", "name"], ["A-1", "Hat"]])).toEqual({ ok: false, error: "columns" });
    expect(tableToRows([["code", "name", "price"], ["", "", ""]])).toEqual({ ok: false, error: "empty" });
    expect(tableToRows([])).toEqual({ ok: false, error: "columns" });
    const big = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) => [`C${i}`, "Hat", "1"]);
    expect(tableToRows([["code", "name", "price"], ...big])).toEqual({ ok: false, error: "too_many" });
  });
});
