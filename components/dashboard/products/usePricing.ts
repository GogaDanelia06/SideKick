"use client";

import { useState } from "react";

/**
 * Keeps price, discount % and sale price consistent: the last edited field wins
 * and the other is derived. Clearing the source clears the derived value.
 */

/** The columns are integers. */
const round = (n: number) => String(Math.round(n));

export const num = (v: string) => {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
};

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

  const basis = () => {
    const p = num(price);
    return p !== null && p > 0 ? p : null;
  };

  function onPrice(value: string) {
    setPrice(value);
    const p = num(value);
    if (p === null || p <= 0) return;

    // When the price changes, a set percentage is kept and the sale price follows.
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

  function reset() {
    setPrice("");
    setDiscountPct("");
    setSalePrice("");
  }

  return { price, discountPct, salePrice, onPrice, onDiscount, onSale, reset };
}
