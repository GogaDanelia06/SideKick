import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getBilling } from "@/lib/dashboard/queries";
import { BillingView } from "@/components/dashboard/billing/BillingView";

export default async function BillingPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const { subscription, payments, cardName } = await getBilling(ctx.businessId, ctx.userId);
  return <BillingView subscription={subscription} payments={payments} cardName={cardName} />;
}
