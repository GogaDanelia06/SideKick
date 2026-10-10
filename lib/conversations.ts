import { prisma } from "@/lib/db";

export function markConversationActive(conversationId: string) {
  return prisma.conversation.updateMany({
    where: { id: conversationId, status: "NEW" },
    data: { status: "ACTIVE" },
  });
}
