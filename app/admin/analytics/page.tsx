import { getPlatformStats } from "@/lib/admin/analytics";
import { getTrafficReport } from "@/lib/analytics/report";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { LiveRefresh } from "@/components/admin/ui/LiveRefresh";
import { GrowthChart } from "@/components/admin/analytics/GrowthChart";
import { IncomePanel } from "@/components/admin/analytics/IncomePanel";
import { PlanDistribution } from "@/components/admin/analytics/PlanDistribution";
import { PlatformCards } from "@/components/admin/analytics/PlatformCards";
import { TrafficPanel } from "@/components/admin/analytics/TrafficPanel";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [stats, traffic] = await Promise.all([getPlatformStats(), getTrafficReport()]);

  return (
    <>
      <AdminHeading
        title="admin.analytics.platformAnalytics"
        subtitle="admin.analytics.subtitle"
        aside={<LiveRefresh />}
      />
      <IncomePanel stats={stats} />
      <PlatformCards stats={stats} />
      <PlanDistribution plans={stats.plans} />
      <GrowthChart growth={stats.growth} />
      <TrafficPanel traffic={traffic} />
    </>
  );
}
