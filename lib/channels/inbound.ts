import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";
import type { InboundMessage } from "./meta";

export type RecordedMessage = {
  businessId: string;
  channel: ChannelType;
  conversationId: string;
  messageId: string;
  isNew: boolean;
  needsName: boolean;
  text: string;
};

const findStored = (conversationId: string, externalId: string) =>
  prisma.message.findUnique({
    where: { conversationId_externalId: { conversationId, externalId } },
    select: { id: true },
  });

export async function recordInbound(
  type: ChannelType,
  msg: InboundMessage,
): Promise<RecordedMessage | null> {
  const channel = await prisma.channel.findUnique({
    where: { type_externalId: { type, externalId: msg.pageId } },
    select: { id: true, businessId: true, connected: true },
  });

  if (msg.pageId === "0") {
    log.info(
      `ignored Meta's ${type} test payload (account id "0") — this is the Dashboard "Test" button, not a real message`,
    );
    return null;
  }

  if (!channel?.connected) {
    log.info(
      `inbound message dropped — no connected ${type} channel for account ${msg.pageId}` +
        (channel ? " (channel exists but is switched off)" : " (no channel has this id)"),
      { channelType: type, accountId: msg.pageId, known: Boolean(channel) },
    );
    return null;
  }

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
    update: {},
    select: { id: true, customerName: true },
  });

  const result = (messageId: string, isNew: boolean): RecordedMessage => ({
    businessId: channel.businessId,
    channel: type,
    needsName: !conversation.customerName,
    text: msg.text,
    conversationId: conversation.id,
    messageId,
    isNew,
  });

  const existing = await findStored(conversation.id, msg.externalId);
  if (existing) return result(existing.id, false);

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
    const winner = await findStored(conversation.id, msg.externalId);
    if (!winner) throw new Error("message insert failed");
    return result(winner.id, false);
  }

  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  return result(messageId, true);
}
