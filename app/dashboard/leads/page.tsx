import { requireContext } from "@/lib/session";
import { getLeads } from "@/lib/dashboard/queries";
import { LeadsView } from "@/components/dashboard/leads/LeadsView";

export default async function LeadsPage() {
  const ctx = await requireContext();
  const leads = await getLeads(ctx.businessId);
  return <LeadsView leads={leads} />;
}
