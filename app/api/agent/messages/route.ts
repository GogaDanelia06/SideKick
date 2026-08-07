import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  MESSAGE_SENDERS,
  authenticate,
  isDenial,
  oneOf,
  readJson,
  requireStr,
} from "@/lib/agent/auth";
import { ownedConversation } from "@/lib/agent/conversation";
import { checkLimit, countMessage } from "@/lib/billing/limits";
import { deliverOutbound } from "@/lib/channels/send";

export const dynamic = "force-dynamic";

/**
 * Records one message in a conversation.
 *
 * Both directions go through here — what the customer said and what the AI
 * answered — because the tenant's inbox is meant to show the whole exchange,
 * not half of it. A conversation moves from NEW to ACTIVE on its first message,
 * which is what the dashboard's "active chats" figure counts.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (isDenial(body)) return body.response;

  const auth = await authenticate(request, body.businessId);
  if (isDenial(auth)) return auth.response;

  const conversationId = requireStr(body, "conversationId");
  if (isDenial(conversationId)) return conversationId.response;

  const text = requireStr(body, "text");
  if (isDenial(text)) return text.response;

  const sender = oneOf(body, "sender", MESSAGE_SENDERS);
  if (isDenial(sender)) return sender.response;
  if (!sender) return NextResponse.json({ error: "sender is required" }, { status: 400 });

  const conversation = await ownedConversation(auth.businessId, conversationId);
  if (isDenial(conversation)) return conversation.response;

  // Only what the AI produces counts against the plan. Refusing to record what
  // a customer already said would lose the tenant's own inbox history over a
  // billing matter, and the customer never agreed to the plan in the first
  // place. The 402 tells the AI service to stop answering this tenant.
  if (sender === "AI") {
    const verdict = await checkLimit(auth.businessId, "messages");
    if (!verdict.allowed) {
      return NextResponse.json(
        {
          error: "message_limit_reached",
          message: `The ${verdict.planName} plan allows ${verdict.limit} AI messages and ${verdict.used} have been used. This reply was not recorded. Customer messages are still accepted — stop generating answers for this business until the plan is upgraded.`,
          limit: verdict.limit,
          used: verdict.used,
        },
        { status: 402 },
      );
    }
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender, text },
    select: { id: true, createdAt: true },
  });

  if (sender === "AI") await countMessage(auth.businessId);

  // A chat with traffic in it is no longer "new". Left alone once a human has
  // marked it DONE — reopening someone's closed conversation is their call.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  // Everything above only wrote to our own database. Without this the AI would
  // hold a fluent conversation that the customer never sees a word of.
  //
  // `CUSTOMER` is excluded because it is a record of what they already said —
  // sending it back would be us repeating their own words to them.
  //
  // Awaited rather than deferred: there is no five-second deadline here, and
  // the caller can act on the answer — stop composing follow-ups once the
  // window has closed, retry later on a failure. A silent send would leave them
  // guessing. It cannot fail the request, though: the message is saved, and
  // losing that over a delivery problem would help nobody.
  const delivery =
    sender === "CUSTOMER" ? null : await deliverOutbound(conversation.id, message.id, text);

  return NextResponse.json({
    messageId: message.id,
    createdAt: message.createdAt,
    // Null means there was nowhere to send it — a dashboard conversation, or a
    // page whose owner has not finished connecting it. Not a failure.
    delivery: delivery ? { status: delivery.status, detail: delivery.detail } : null,
  });
}
