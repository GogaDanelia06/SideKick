import { prisma } from "@/lib/db";
import { notFound, type AgentDenial } from "./auth";

/** The named conversation, only if it belongs to this business. */
export async function ownedConversation(
  businessId: string,
  conversationId: string,
): Promise<{ id: string } | AgentDenial> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId },
    select: { id: true },
  });
  return conversation ?? notFound("conversation not found for this business");
}
