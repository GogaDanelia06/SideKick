import type { Text } from "@/lib/i18n/messages";
import { textIn } from "@/lib/i18n/messages";

export type ColumnKey =
  | "code"
  | "name"
  | "price"
  | "discountPct"
  | "salePrice"
  | "quantity"
  | "size"
  | "description";

type Column = { key: ColumnKey; label: Text; aliases: string[] };

/** The product file's columns in template order. Headers match in either language or by a common alias. */
export const PRODUCT_COLUMNS: Column[] = [
  { key: "code", label: "products.columns.code", aliases: ["sku", "article", "არტიკული"] },
  { key: "name", label: "products.columns.name", aliases: ["title", "product", "სახელი", "პროდუქტი"] },
  { key: "price", label: "products.columns.price", aliases: [] },
  { key: "discountPct", label: "products.columns.discount", aliases: ["discount", "ფასდაკლება"] },
  { key: "salePrice", label: "products.columns.salePrice", aliases: ["sale", "ფასდაკლებით"] },
  { key: "quantity", label: "products.columns.quantity", aliases: ["qty", "stock", "მარაგი", "მარაგში"] },
  { key: "size", label: "products.columns.size", aliases: [] },
  { key: "description", label: "products.columns.description", aliases: [] },
];

/** Without these a row cannot become a product. */
export const REQUIRED_COLUMNS: ColumnKey[] = ["code", "name", "price"];

const normal = (s: string) => s.replace(/^﻿/, "").trim().toLowerCase().replace(/\s+/g, " ");

const LOOKUP = new Map(
  PRODUCT_COLUMNS.flatMap((c) => [c.key, textIn("ka", c.label), textIn("en", c.label), ...c.aliases].map((name) => [normal(name), c.key])),
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
