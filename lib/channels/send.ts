import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import type { ChannelType } from "@prisma/client";
import { type DeliveryResult, sendToMessenger } from "./messengerSend";

const SENDABLE = new Set<ChannelType>(["FACEBOOK", "INSTAGRAM"]);

export async function deliverOutbound(
  conversationId: string,
  messageId: string,
  text: string,
): Promise<DeliveryResult | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      customerRef: true,
      channel: {
        select: { type: true, connected: true, externalId: true, accessToken: true },
      },
    },
  });

  const channel = conversation?.channel;
  if (
    !conversation?.customerRef ||
    !channel ||
    !SENDABLE.has(channel.type) ||
    !channel.connected ||
    !channel.externalId ||
    !channel.accessToken
  ) {
    return null;
  }

  const result = await sendToMessenger(
    channel.externalId,
    channel.accessToken,
    conversation.customerRef,
    text,
    channel.type,
  );

  await prisma.message.update({
    where: { id: messageId },
    data: {
      deliveryStatus: result.status,
      ...(result.externalId ? { externalId: result.externalId } : {}),
    },
  });

  if (result.status === "FAILED") {
    log.error("messenger delivery failed", undefined, {
      conversationId,
      messageId,
      detail: result.detail,
    });
  } else if (result.status === "WINDOW_CLOSED") {
    log.warn("messenger delivery refused — 24h window closed", { conversationId, messageId });
  }

  return result;
}

export { sendToMessenger, type DeliveryResult, type DeliveryStatus } from "./messengerSend";
