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
      // Both are 402 and both mean "stop generating for this tenant", but the
      // AI team reads these messages when a customer complains, and "renew" and
      // "upgrade" send them to two different conversations.
      const expired = verdict.reason === "expired";
      return NextResponse.json(
        {
          error: expired ? "subscription_expired" : "message_limit_reached",
          message: expired
            ? `This business's subscription has lapsed and its grace period is over. This reply was not recorded. Customer messages are still accepted — stop generating answers until it is renewed.`
            : `The ${verdict.planName} plan allows ${verdict.limit} AI messages and ${verdict.used} have been used. This reply was not recorded. Customer messages are still accepted — stop generating answers for this business until the plan is upgraded.`,
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

/** Enough for a model's context without letting one long chat page the world. */
const HISTORY_LIMIT = 100;

/**
 * The conversation so far, oldest first.
 *
 * Added because the AI service had nowhere to read history from and was about to
 * keep its own copy of it. Two stores of the same exchange drift, and when they
 * do the merchant's inbox and the model's memory disagree about what a customer
 * said — with the inbox being the one the merchant believes. So this is offered
 * instead: one store, read over the same authenticated contract as everything
 * else the service already asks us for.
 *
 * Oldest first because that is the order a transcript is read in and the order a
 * prompt wants; `take` from the end and reverse, so a long chat returns its most
 * recent hundred rather than its first.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const conversationId = url.searchParams.get("conversationId");

  const auth = await authenticate(request, businessId);
  if (isDenial(auth)) return auth.response;

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  // Ownership, not just existence: an id from another tenant must read as absent
  // rather than as forbidden, and must never return a single row either way.
  const owned = await ownedConversation(auth.businessId, conversationId);
  if (isDenial(owned)) return owned.response;

  const limit = Math.min(HISTORY_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || HISTORY_LIMIT));

  const rows = await prisma.message.findMany({
    where: { conversationId: owned.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, sender: true, text: true, createdAt: true, stoppedReason: true },
  });

  return NextResponse.json({
    conversationId: owned.id,
    messages: rows.reverse().map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      at: m.createdAt.toISOString(),
      stoppedReason: m.stoppedReason,
    })),
  });
}
