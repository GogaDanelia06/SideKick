import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { askAi, aiConfigured } from "./client";
import { deliverOutbound } from "@/lib/channels/send";

/**
 * How long a conversation stays with a person once the AI asks for help.
 *
 * Matches Meta's reply window on purpose. Shorter and the bot resumes a
 * conversation an operator is still in the middle of; longer and a chat nobody
 * picked up is silently abandoned rather than answered. Either way the operator
 * can hand it straight back — see `releaseToBot`.
 */
const HANDOFF_HOURS = 24;

/**
 * Answers one customer message, start to finish.
 *
 * Never called inside the webhook request. A language model does not answer in
 * Meta's five seconds, so this runs from `after()` — by which point the
 * customer's message is already stored and the 200 already sent.
 *
 * Returns quietly in every case where not answering is the right behaviour, so
 * the caller has nothing to decide.
 */
export async function answerCustomer(
  businessId: string,
  conversationId: string,
  text: string,
): Promise<void> {
  if (!aiConfigured()) {
    log.info("AI reply skipped — AI_SERVICE_URL/KEY not set", { conversationId });
    return;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { aiEnabled: true, botPausedUntil: true },
  });
  if (!conversation) return;

  // Two separate ways to keep the bot quiet, and both are deliberate choices by
  // a person: the tenant switching AI off for this chat, and an operator having
  // taken it over. Answering across either would talk over a human.
  if (!conversation.aiEnabled) return;
  if (conversation.botPausedUntil && conversation.botPausedUntil > new Date()) return;

  const answer = await askAi(businessId, conversationId, text);

  if (!answer) {
    // Recorded on the conversation's newest message so the inbox shows the "AI
    // error" mark. Without this the chat just sits there looking answered.
    await markLastMessage(conversationId, "ai_error");
    return;
  }

  const message = await prisma.message.create({
    data: { conversationId, sender: "AI", text: answer.reply },
    select: { id: true },
  });

  // Stored first, sent second. If delivery fails the merchant can still see
  // what the AI said and send it themselves; the reverse — delivered but not
  // recorded — would show the customer an answer the inbox has no memory of.
  await deliverOutbound(conversationId, message.id, answer.reply);

  if (answer.handoffRequested) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { botPausedUntil: new Date(Date.now() + HANDOFF_HOURS * 60 * 60_000) },
    });
    await prisma.message.update({
      where: { id: message.id },
      data: { stoppedReason: answer.handoffReason ?? "handoff" },
    });
    log.info("AI handed a conversation to a person", {
      conversationId,
      reason: answer.handoffReason,
    });
  }
}

/** Puts a reason on the newest message, which is where the inbox reads it. */
async function markLastMessage(conversationId: string, reason: string): Promise<void> {
  const last = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (last) {
    await prisma.message.update({ where: { id: last.id }, data: { stoppedReason: reason } });
  }
}
