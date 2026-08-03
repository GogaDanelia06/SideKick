/**
 * What a product costs, decided here and nowhere else.
 *
 * The AI service sends a product code and a quantity. It does not send a price,
 * and if it did we would ignore it: a second pricing implementation on their
 * side is a second thing that can be wrong about money, and the tenant is the
 * one who would eat the difference. This mirrors `amountFor` in the billing
 * checkout for exactly the same reason.
 */

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

/**
 * Turns the caller's lines into priced ones, or names what went wrong.
 *
 * Snapshots the code and name onto the order line because a tenant renaming a
 * product next month must not rewrite what a customer ordered today.
 */
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
