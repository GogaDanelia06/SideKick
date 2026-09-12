import { prisma } from "@/lib/db";

/** Traffic moves a NEW conversation to ACTIVE; one marked DONE is never reopened. */
export function markConversationActive(conversationId: string) {
  return prisma.conversation.updateMany({
    where: { id: conversationId, status: "NEW" },
    data: { status: "ACTIVE" },
  });
}
