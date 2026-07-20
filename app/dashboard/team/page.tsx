import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getTeam } from "@/lib/dashboard/queries";
import { TeamView } from "@/components/dashboard/team/TeamView";

export default async function TeamPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const members = await getTeam(ctx.businessId);
  return <TeamView members={members} />;
}
