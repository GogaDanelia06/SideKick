import { prisma } from "@/lib/db";
import { notFound, type AgentDenial } from "./auth";

/**
 * Resolves a conversation the caller named, and refuses one it does not own.
 *
 * The `businessId` in the filter is the point of this function. Looking a
 * conversation up by id alone would let a wrong id — or a guessed one — attach
 * a message or an order to another tenant's chat. Filtering by both means the
 * worst outcome of a bad id is a 404.
 */
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
