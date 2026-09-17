import type { Bilingual } from "@/lib/content/types";

export type ColumnKey =
  | "code"
  | "name"
  | "price"
  | "discountPct"
  | "salePrice"
  | "quantity"
  | "size"
  | "description";

type Column = { key: ColumnKey; label: Bilingual; aliases: string[] };

/** The product file's columns in template order. Headers match in either language or by a common alias. */
export const PRODUCT_COLUMNS: Column[] = [
  { key: "code", label: { ka: "კოდი", en: "Code" }, aliases: ["sku", "article", "არტიკული"] },
  { key: "name", label: { ka: "დასახელება", en: "Name" }, aliases: ["title", "product", "სახელი", "პროდუქტი"] },
  { key: "price", label: { ka: "ფასი", en: "Price" }, aliases: [] },
  { key: "discountPct", label: { ka: "ფასდაკლება %", en: "Discount %" }, aliases: ["discount", "ფასდაკლება"] },
  { key: "salePrice", label: { ka: "ფასდაკლებული ფასი", en: "Sale price" }, aliases: ["sale", "ფასდაკლებით"] },
  { key: "quantity", label: { ka: "რაოდენობა", en: "Quantity" }, aliases: ["qty", "stock", "მარაგი", "მარაგში"] },
  { key: "size", label: { ka: "ზომა", en: "Size" }, aliases: [] },
  { key: "description", label: { ka: "აღწერა", en: "Description" }, aliases: [] },
];

/** Without these a row cannot become a product. */
export const REQUIRED_COLUMNS: ColumnKey[] = ["code", "name", "price"];

const normal = (s: string) => s.replace(/^﻿/, "").trim().toLowerCase().replace(/\s+/g, " ");

const LOOKUP = new Map(
  PRODUCT_COLUMNS.flatMap((c) => [c.key, c.label.ka, c.label.en, ...c.aliases].map((name) => [normal(name), c.key])),
);

/** Which column each header cell names; unknown and repeated columns read as null and are skipped. */
export function matchHeaders(header: string[]): (ColumnKey | null)[] {
  const seen = new Set<ColumnKey>();
  return header.map((cell) => {
    const key = LOOKUP.get(normal(cell)) ?? null;
    if (!key || seen.has(key)) return null;
    seen.add(key);
    return key;
  });
}
