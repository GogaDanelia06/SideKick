import { redirect } from "next/navigation";
import { getContext } from "@/lib/session";
import { getChannels } from "@/lib/dashboard/queries";
import { ChannelsView } from "@/components/dashboard/channels/ChannelsView";

export default async function ChannelsPage() {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  const channels = await getChannels(ctx.businessId);
  return <ChannelsView channels={channels} />;
}
