import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getLeads } from "@/lib/dashboard/queries";
import { LeadsView } from "@/components/dashboard/leads/LeadsView";

export default async function LeadsPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const leads = await getLeads(ctx.businessId);
  return <LeadsView leads={leads} />;
}
