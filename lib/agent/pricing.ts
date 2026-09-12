/** Product pricing for AI orders; prices are always computed here, never taken from the caller. */

export type PricedProduct = {
  id: string;
  code: string;
  name: string;
  price: number;
  salePrice: number | null;
};

/** The price a customer actually pays: the sale price when one is set. */
export function effectivePrice(product: Pick<PricedProduct, "price" | "salePrice">): number {
  return product.salePrice != null && product.salePrice > 0 ? product.salePrice : product.price;
}

export type AgentOrderLine = { code: string; qty: number };

export type PricedLine = {
  productId: string;
  codeSnapshot: string;
  nameSnapshot: string;
  qty: number;
  price: number;
  lineTotal: number;
};

/** Prices the caller's lines, snapshotting code and name so later product edits don't rewrite orders. */
export function priceLines(
  lines: AgentOrderLine[],
  catalogue: PricedProduct[],
): { items: PricedLine[]; total: number } | { error: string } {
  if (lines.length === 0) return { error: "items must contain at least one line" };

  const byCode = new Map(catalogue.map((p) => [p.code, p]));
  const items: PricedLine[] = [];

  for (const line of lines) {
    if (!Number.isInteger(line.qty) || line.qty < 1) {
      return { error: `qty for "${line.code}" must be a whole number of at least 1` };
    }

    const product = byCode.get(line.code);
    if (!product) return { error: `no product with code "${line.code}" for this business` };

    const price = effectivePrice(product);
    items.push({
      productId: product.id,
      codeSnapshot: product.code,
      nameSnapshot: product.name,
      qty: line.qty,
      price,
      lineTotal: price * line.qty,
    });
  }

  return { items, total: items.reduce((sum, i) => sum + i.lineTotal, 0) };
}
