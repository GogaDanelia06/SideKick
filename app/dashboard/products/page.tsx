import { requireContext } from "@/lib/session";
import { getProducts } from "@/lib/dashboard/queries";
import { ProductsView } from "@/components/dashboard/products/ProductsView";

export default async function ProductsPage() {
  const ctx = await requireContext();
  const products = await getProducts(ctx.businessId);
  return <ProductsView products={products} />;
}
