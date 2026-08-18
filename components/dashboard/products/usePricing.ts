"use client";

import { useState } from "react";

/**
 * Keeps price, discount and sale price agreeing with each other.
 *
 * Two of the three are enough to know the third, and a merchant pricing a
 * product thinks in whichever two suit the moment: "twenty-five thousand, ten
 * percent off" or "twenty-five thousand, sells for twenty-two five". Making
 * them type the third themselves is arithmetic homework, and the answer they
 * type is the one that ends up wrong.
 *
 * Whichever field was last edited wins, and the other is derived from it. Clear
 * the source and the derived one clears too — a discount with no percentage and
 * no price is a leftover, not a value.
 */

/** All three columns are Int in the schema, so nothing keeps a fraction. */
const round = (n: number) => String(Math.round(n));

export const num = (v: string) => {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
};

/** The two sums, kept out of the hook so they can be tested as arithmetic. */
export const saleFromPct = (price: number, pct: number) => round(price * (1 - pct / 100));
export const pctFromSale = (price: number, sale: number) => round((1 - sale / price) * 100);

export type Pricing = ReturnType<typeof usePricing>;

export function usePricing(initial?: {
  price?: number | null;
  discountPct?: number | null;
  salePrice?: number | null;
}) {
  const str = (v: number | null | undefined) => (v == null ? "" : String(v));

  const [price, setPrice] = useState(str(initial?.price));
  const [discountPct, setDiscountPct] = useState(str(initial?.discountPct));
  const [salePrice, setSalePrice] = useState(str(initial?.salePrice));

  /** Nothing can be derived from a missing or zero price — division by it, or by nothing. */
  const basis = () => {
    const p = num(price);
    return p !== null && p > 0 ? p : null;
  };

  function onPrice(value: string) {
    setPrice(value);
    const p = num(value);
    if (p === null || p <= 0) return;

    // The discount is the merchant's intent; the sale price is its consequence.
    // So when the price moves, a percentage they set is what survives.
    const pct = num(discountPct);
    if (pct !== null) {
      setSalePrice(saleFromPct(p, pct));
      return;
    }
    const sale = num(salePrice);
    if (sale !== null) setDiscountPct(pctFromSale(p, sale));
  }

  function onDiscount(value: string) {
    setDiscountPct(value);
    const pct = num(value);
    if (pct === null) {
      setSalePrice("");
      return;
    }
    const p = basis();
    if (p !== null) setSalePrice(saleFromPct(p, pct));
  }

  function onSale(value: string) {
    setSalePrice(value);
    const sale = num(value);
    if (sale === null) {
      setDiscountPct("");
      return;
    }
    const p = basis();
    if (p !== null) setDiscountPct(pctFromSale(p, sale));
  }

  /** Emptied after a successful save, alongside the form's own reset. */
  function reset() {
    setPrice("");
    setDiscountPct("");
    setSalePrice("");
  }

  return { price, discountPct, salePrice, onPrice, onDiscount, onSale, reset };
}
