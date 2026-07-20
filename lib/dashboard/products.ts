import type { Bilingual } from "@/lib/content/types";

export type Product = {
  name: string;
  code: string;
  price: string;
  sale: string;
  stock: number;
};

export const PRODUCTS: Product[] = [
  { name: "თეთრი კაბა", code: "DR-014", price: "189₾", sale: "159₾", stock: 24 },
  { name: "iPhone 15 Pro", code: "PH-201", price: "3,500₾", sale: "—", stock: 6 },
  { name: "სპორტული ფეხსაცმელი", code: "SH-088", price: "249₾", sale: "199₾", stock: 0 },
  { name: "AirPods Pro", code: "AP-045", price: "649₾", sale: "—", stock: 13 },
  { name: "ტყავის ჩანთა", code: "BG-112", price: "420₾", sale: "380₾", stock: 3 },
];

export function stockText(n: number): Bilingual {
  return n === 0 ? { ka: "0 · ამოიწურა", en: "0 · out" } : { ka: String(n), en: String(n) };
}

/** Red when out, amber when low (<5), otherwise default ink. */
export function stockClass(n: number): string {
  return n === 0 ? "text-red" : n < 5 ? "text-amber" : "text-ink";
}
