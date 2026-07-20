import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getProducts } from "@/lib/dashboard/queries";
import { ProductsView } from "@/components/dashboard/products/ProductsView";

export default async function ProductsPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const products = await getProducts(ctx.businessId);
  return <ProductsView products={products} />;
}
