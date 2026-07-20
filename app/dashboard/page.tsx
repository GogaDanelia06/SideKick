import { KpiGrid } from "@/components/dashboard/home/KpiGrid";
import { LimitCard } from "@/components/dashboard/home/LimitCard";
import { ChannelStatusCard } from "@/components/dashboard/home/ChannelStatusCard";
import { StoppedMessages } from "@/components/dashboard/home/StoppedMessages";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-5">
      <KpiGrid />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <LimitCard />
        <ChannelStatusCard />
      </div>
      <StoppedMessages />
    </div>
  );
}
