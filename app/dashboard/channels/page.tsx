import { requireContext } from "@/lib/session";
import { getChannels } from "@/lib/dashboard/queries";
import { ChannelsView } from "@/components/dashboard/channels/ChannelsView";

export default async function ChannelsPage() {
  const ctx = await requireContext();
  const channels = await getChannels(ctx.businessId);
  return <ChannelsView channels={channels} />;
}
