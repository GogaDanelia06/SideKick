import { requireContext } from "@/lib/session";
import { getOrders } from "@/lib/dashboard/queries";
import { OrdersView } from "@/components/dashboard/orders/OrdersView";

export default async function OrdersPage() {
  const ctx = await requireContext();
  const { orders, counts } = await getOrders(ctx.businessId);
  return <OrdersView orders={orders} counts={counts} />;
}
