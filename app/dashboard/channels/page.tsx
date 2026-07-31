import { requireContext } from "@/lib/session";
import { getChannels } from "@/lib/dashboard/queries";
import { getChannelGuides } from "@/lib/dashboard/tutorials";
import { ChannelsView } from "@/components/dashboard/channels/ChannelsView";

export default async function ChannelsPage() {
  const ctx = await requireContext();
  const [channels, guides] = await Promise.all([
    getChannels(ctx.businessId),
    getChannelGuides(),
  ]);
  return <ChannelsView channels={channels} guides={guides} />;
}
