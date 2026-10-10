import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { graphHostFor } from "./graphHost";
import { fetchCustomerName } from "./customerProfile";

export async function nameCustomer(conversationId: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      customerRef: true,
      customerName: true,
      channel: { select: { type: true, accessToken: true } },
    },
  });

  const channel = conversation?.channel;

  const fields =
    channel?.type === "INSTAGRAM"
      ? "name,username"
      : channel?.type === "FACEBOOK"
        ? "first_name,last_name"
        : null;

  const blocked =
    !conversation ? "conversation not found"
    : !conversation.customerRef ? "conversation has no customer id"
    : !channel ? "conversation is not attached to a channel"
    : !channel.accessToken ? "channel holds no access token"
    : !fields ? `no profile fields for a ${channel.type} channel`
    : null;

  if (blocked) {
    log.info(`skipped naming a customer — ${blocked}`, {
      conversationId,
      channelType: channel?.type ?? null,
    });
    return;
  }
  if (!conversation?.customerRef || !channel?.accessToken || !fields) return;

  if (conversation.customerName) return;

  const name = await fetchCustomerName(
    conversation.customerRef,
    channel.accessToken,
    fields,
    graphHostFor(channel.type, channel.accessToken),
  );
  if (!name) return;

  await prisma.conversation.updateMany({
    where: { id: conversationId, customerName: null },
    data: { customerName: name },
  });
}
