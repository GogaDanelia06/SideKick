import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";
import type { InboundMessage } from "./meta";

export type RecordedMessage = {
  businessId: string;
  channel: ChannelType;
  conversationId: string;
  messageId: string;
  /** False when this exact platform message had already been stored. */
  isNew: boolean;
  /** The conversation has no customer name yet. */
  needsName: boolean;
  text: string;
};

/**
 * Stores one customer message under the business that owns the receiving account.
 * Returns null for Meta's test payloads and for accounts without a connected
 * channel; those are not errors and must not trigger retries.
 */
export async function recordInbound(
  type: ChannelType,
  msg: InboundMessage,
): Promise<RecordedMessage | null> {
  const channel = await prisma.channel.findUnique({
    where: { type_externalId: { type, externalId: msg.pageId } },
    select: { id: true, businessId: true, connected: true },
  });

  // The App Dashboard "Test" button sends placeholder ids ("0").
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
    // Only fetches the existing row; the status change happens below.
    update: {},
    select: { id: true, customerName: true },
  });

  // Retries are found here; concurrent duplicates hit the unique index below.
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
      channel: type,
      needsName: !conversation.customerName,
      text: msg.text,
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
    // A concurrent delivery of the same message won the insert; use its row.
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
      channel: type,
      needsName: !conversation.customerName,
      text: msg.text,
      conversationId: conversation.id,
      messageId: winner.id,
      isNew: false,
    };
  }

  // New traffic moves NEW to ACTIVE but never reopens a conversation marked DONE.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  return {
    businessId: channel.businessId,
    channel: type,
    needsName: !conversation.customerName,
    text: msg.text,
    conversationId: conversation.id,
    messageId,
    isNew: true,
  };
}
