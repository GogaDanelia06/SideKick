import type { ChannelType } from "@prisma/client";
import { requireContext } from "@/lib/session";
import { getAnalytics } from "@/lib/dashboard/queries";
import { AnalyticsView } from "@/components/dashboard/analytics/AnalyticsView";

const RANGE_DAYS = [7, 30, 90, 180, 365];
const CHANNELS: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; channel?: string }>;
}) {
  const ctx = await requireContext();
  const sp = await searchParams;

  const rangeIndex = Math.min(Math.max(Number(sp.range ?? 1) || 0, 0), RANGE_DAYS.length - 1);
  const channel = CHANNELS.includes(sp.channel as ChannelType) ? (sp.channel as ChannelType) : null;

  const data = await getAnalytics(ctx.businessId, RANGE_DAYS[rangeIndex], channel ?? undefined);

  return <AnalyticsView data={data} rangeIndex={rangeIndex} channel={channel} />;
}
