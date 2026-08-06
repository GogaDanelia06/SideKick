import { prisma } from "@/lib/db";
import type { ChannelType } from "@prisma/client";
import type { InboundMessage } from "./meta";

export type RecordedMessage = {
  businessId: string;
  conversationId: string;
  messageId: string;
  /** False when this exact platform message had already been stored. */
  isNew: boolean;
};

/**
 * Files one customer message under the tenant that owns the page it arrived on.
 *
 * Returns null when no channel claims the page. That is not an error worth
 * shouting about: a Meta app can be subscribed to pages belonging to businesses
 * that never finished connecting here, and every one of them will deliver
 * events. Treating it as a failure would turn other people's traffic into our
 * alerts — and, worse, into retries.
 */
export async function recordInbound(
  type: ChannelType,
  msg: InboundMessage,
): Promise<RecordedMessage | null> {
  const channel = await prisma.channel.findUnique({
    where: { type_externalId: { type, externalId: msg.pageId } },
    select: { id: true, businessId: true, connected: true },
  });

  // A channel that exists but is switched off is a deliberate "stop answering
  // for me", so it is dropped as firmly as an unknown page. Storing it anyway
  // would fill an inbox the tenant has asked to be quiet.
  if (!channel?.connected) return null;

  const conversation = await prisma.conversation.upsert({
    where: {
      businessId_customerRef: { businessId: channel.businessId, customerRef: msg.senderId },
    },
    create: {
      businessId: channel.businessId,
      channelId: channel.id,
      customerRef: msg.senderId,
      status: "ACTIVE",
    },
    // Nothing to change on an existing chat here; the status move is below,
    // where it can be made conditional. The upsert is for getting the same row
    // back on a second message rather than for editing it.
    update: {},
    select: { id: true },
  });

  // Postgres decides the duplicate, not a read-then-write in this process: two
  // deliveries of the same retry can arrive at once, and a check-first version
  // would let both through the gap between the check and the insert.
  const existing = await prisma.message.findUnique({
    where: {
      conversationId_externalId: {
        conversationId: conversation.id,
        externalId: msg.externalId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return {
      businessId: channel.businessId,
      conversationId: conversation.id,
      messageId: existing.id,
      isNew: false,
    };
  }

  let messageId: string;
  try {
    const created = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "CUSTOMER",
        text: msg.text,
        externalId: msg.externalId,
      },
      select: { id: true },
    });
    messageId = created.id;
  } catch {
    // The unique index fired, which means a concurrent delivery of the same
    // retry won the race. Its row is the right answer; ours was the duplicate.
    const winner = await prisma.message.findUnique({
      where: {
        conversationId_externalId: {
          conversationId: conversation.id,
          externalId: msg.externalId,
        },
      },
      select: { id: true },
    });
    if (!winner) throw new Error("message insert failed");
    return {
      businessId: channel.businessId,
      conversationId: conversation.id,
      messageId: winner.id,
      isNew: false,
    };
  }

  // Same rule the agent API uses: traffic makes a chat no longer "new", but a
  // conversation a human has marked DONE stays closed. Reopening it is their
  // call, not an incoming message's.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  return {
    businessId: channel.businessId,
    conversationId: conversation.id,
    messageId,
    isNew: true,
  };
}
