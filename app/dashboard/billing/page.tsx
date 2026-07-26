import { requireContext } from "@/lib/session";
import { getBilling } from "@/lib/dashboard/queries";
import { BillingView } from "@/components/dashboard/billing/BillingView";

export default async function BillingPage() {
  const ctx = await requireContext();
  const { subscription, payments, cardName, plans } = await getBilling(ctx.businessId, ctx.userId);
  return <BillingView subscription={subscription} payments={payments} cardName={cardName} plans={plans} />;
}
