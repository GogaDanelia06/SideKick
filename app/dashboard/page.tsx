import { requireContext } from "@/lib/session";
import { getHomeOverview } from "@/lib/dashboard/queries";
import { KpiGrid } from "@/components/dashboard/home/KpiGrid";
import { LimitCard } from "@/components/dashboard/home/LimitCard";
import { ChannelStatusCard } from "@/components/dashboard/home/ChannelStatusCard";
import { StoppedMessages } from "@/components/dashboard/home/StoppedMessages";

export default async function DashboardHomePage() {
  const ctx = await requireContext();
  const { kpis, limit, channels, stopped } = await getHomeOverview(ctx.businessId);

  return (
    <div className="flex flex-col gap-5">
      <KpiGrid kpis={kpis} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <LimitCard limit={limit} />
        <ChannelStatusCard channels={channels} />
      </div>
      <StoppedMessages items={stopped} />
    </div>
  );
}
