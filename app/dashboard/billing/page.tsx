import { requireContext } from "@/lib/session";
import { getBilling } from "@/lib/dashboard/queries";
import { availableProviders } from "@/lib/payments";
import { can } from "@/lib/auth/permissions";
import { BillingView } from "@/components/dashboard/billing/BillingView";

export default async function BillingPage() {
  const ctx = await requireContext();
  const { subscription, payments, cardName, plans } = await getBilling(ctx.businessId, ctx.userId);
  return (
    <BillingView
      subscription={subscription}
      payments={payments}
      cardName={cardName}
      plans={plans}
      providers={availableProviders()}
      canManage={can(ctx.role, "billing:manage")}
    />
  );
}
