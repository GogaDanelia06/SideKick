import type { ColumnKey } from "./columns";

/** One product from a file. An absent optional field keeps the product's current value. */
export type ImportRow = {
  code: string;
  name: string;
  price: number;
  discountPct?: number;
  salePrice?: number;
  quantity?: number;
  size?: string;
  description?: string;
};

export type RowProblem = "code" | "name" | "price" | "discount" | "sale" | "quantity" | "too_long" | "duplicate";

const MAX_LENGTH = { code: 64, name: 200, size: 50, description: 2000 };

/**
 * A spreadsheet number: "1 200", "1,200.50", "1.200,50", "12,5" and "₾15" all read.
 * Empty is undefined; anything else that is not a number is null.
 */
export function readNumber(raw: string | undefined): number | null | undefined {
  let s = (raw ?? "").replace(/[\s ₾$€]/g, "");
  if (s === "") return undefined;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const inRange = (n: number | undefined, max = Infinity) => n === undefined || (n >= 0 && n <= max);

/** Turns one line of cells into a product, or says what is wrong with it. */
export function checkRow(cells: Partial<Record<ColumnKey, string>>): { row: ImportRow } | { problem: RowProblem } {
  const text = (key: ColumnKey) => (cells[key] ?? "").trim();
  const [code, name, size, description] = [text("code"), text("name"), text("size"), text("description")];
  if (!code) return { problem: "code" };
  if (!name) return { problem: "name" };
  const long = Object.entries({ code, name, size, description }).some(
    ([key, value]) => value.length > MAX_LENGTH[key as keyof typeof MAX_LENGTH],
  );
  if (long) return { problem: "too_long" };

  const price = readNumber(cells.price);
  const discount = readNumber(cells.discountPct);
  const sale = readNumber(cells.salePrice);
  const quantity = readNumber(cells.quantity);
  if (price == null || price < 0) return { problem: "price" };
  if (discount === null || !inRange(discount, 100)) return { problem: "discount" };
  if (sale === null || !inRange(sale, price)) return { problem: "sale" };
  if (quantity === null || !inRange(quantity) || (quantity !== undefined && !Number.isInteger(quantity))) {
    return { problem: "quantity" };
  }

  const row: ImportRow = { code, name, price: Math.round(price) };
  // As in the product form: either discount value gives the other.
  if (discount !== undefined) {
    row.discountPct = Math.round(discount);
    row.salePrice = Math.round(sale ?? price * (1 - discount / 100));
  } else if (sale !== undefined) {
    row.salePrice = Math.round(sale);
    row.discountPct = price > 0 ? Math.round((1 - sale / price) * 100) : 0;
  }
  if (quantity !== undefined) row.quantity = quantity;
  if (size) row.size = size;
  if (description) row.description = description;
  return { row };
}

const isText = (v: unknown, max: number) => typeof v === "string" && v.trim() !== "" && v.length <= max;
const isWhole = (v: unknown, max = Infinity) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;

/** The server's check of a row it did not parse itself. */
export function isImportRow(value: unknown): value is ImportRow {
  const r = value as Partial<ImportRow> | null;
  return (
    typeof r === "object" && r !== null &&
    isText(r.code, MAX_LENGTH.code) && isText(r.name, MAX_LENGTH.name) && isWhole(r.price) &&
    (r.discountPct === undefined || isWhole(r.discountPct, 100)) &&
    (r.salePrice === undefined || isWhole(r.salePrice, r.price)) &&
    (r.quantity === undefined || isWhole(r.quantity)) &&
    (r.size === undefined || isText(r.size, MAX_LENGTH.size)) &&
    (r.description === undefined || isText(r.description, MAX_LENGTH.description))
  );
}
