import { NextResponse } from "next/server";
import { applyReplyStyle } from "@/lib/ai/replyStyle";
import { checkLimit } from "@/lib/billing/limits";
import { badRequest, type AgentDenial } from "./auth";

/**
 * The text an AI message is recorded and sent with: styled the way the business chose,
 * and refused once the plan's AI messages are spent.
 */
export async function acceptAiReply(businessId: string, text: string): Promise<string | AgentDenial> {
  const reply = await applyReplyStyle(businessId, text);
  if (!reply) return badRequest("text is empty once emoji are removed; this business chose no emoji");

  const verdict = await checkLimit(businessId, "messages");
  if (verdict.allowed) return reply;

  const expired = verdict.reason === "expired";
  const message = expired
    ? "This business's subscription has lapsed and its grace period is over. This reply was not recorded. Customer messages are still accepted — stop generating answers until it is renewed."
    : `The ${verdict.planName} plan allows ${verdict.limit} AI messages and ${verdict.used} have been used. This reply was not recorded. Customer messages are still accepted — stop generating answers for this business until the plan is upgraded.`;

  return {
    response: NextResponse.json(
      {
        error: expired ? "subscription_expired" : "message_limit_reached",
        message,
        limit: verdict.limit,
        used: verdict.used,
      },
      { status: 402 },
    ),
  };
}
