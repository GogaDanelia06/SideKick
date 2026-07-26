import type { ChannelType } from "@prisma/client";
import { requireContext } from "@/lib/session";
import { getConversation, getConversations } from "@/lib/dashboard/queries";
import { ConversationsView } from "@/components/dashboard/conversations/ConversationsView";
import { CHANNEL_ORDER } from "@/lib/dashboard/channelMeta";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; channel?: string }>;
}) {
  const ctx = await requireContext();
  const sp = await searchParams;

  const channel = CHANNEL_ORDER.includes(sp.channel as ChannelType)
    ? (sp.channel as ChannelType)
    : null;

  const conversations = await getConversations(ctx.businessId, channel ?? undefined);
  const selected = sp.c ? await getConversation(ctx.businessId, sp.c) : null;

  return (
    <ConversationsView conversations={conversations} selected={selected} channel={channel} />
  );
}
