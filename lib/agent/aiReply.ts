import { NextResponse } from "next/server";
import { applyReplyStyle } from "@/lib/ai/replyStyle";
import { checkLimit } from "@/lib/billing/limits";
import { badRequest, type AgentDenial } from "./auth";
import { textIn } from "@/lib/i18n/messages";

export async function acceptAiReply(businessId: string, text: string): Promise<string | AgentDenial> {
  const reply = await applyReplyStyle(businessId, text);
  if (!reply) return badRequest("text is empty once emoji are removed; this business chose no emoji");

  const verdict = await checkLimit(businessId, "messages");
  if (verdict.allowed) return reply;

  const message = {
    expired:
      "This business's subscription has lapsed and its grace period is over. This reply was not recorded. Customer messages are still accepted — stop generating answers until it is renewed.",
    inactive:
      "This business has not been activated yet (no paid plan). This reply was not recorded. Customer messages are still accepted — stop generating answers until it is activated.",
    limit: `The ${textIn("en", verdict.planName)} plan allows ${verdict.limit} AI messages and ${verdict.used} have been used. This reply was not recorded. Customer messages are still accepted — stop generating answers for this business until the plan is upgraded.`,
  }[verdict.reason];
  const error = { expired: "subscription_expired", inactive: "subscription_inactive", limit: "message_limit_reached" }[verdict.reason];

  return {
    response: NextResponse.json(
      {
        error,
        message,
        limit: verdict.limit,
        used: verdict.used,
      },
      { status: 402 },
    ),
  };
}
