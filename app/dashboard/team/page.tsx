import { requireContext } from "@/lib/session";
import { getTeam } from "@/lib/dashboard/queries";
import { TeamView } from "@/components/dashboard/team/TeamView";

export default async function TeamPage() {
  const ctx = await requireContext();
  const members = await getTeam(ctx.businessId);
  return <TeamView members={members} />;
}
