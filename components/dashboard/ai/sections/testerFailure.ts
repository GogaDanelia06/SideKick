import type { TestReply } from "@/lib/dashboard/actions/assistant";
import type { Text } from "@/lib/i18n/messages";

export function testerFailure(reply: TestReply | null): Text {
  if (reply && !reply.ok && reply.error === "forbidden") return "dashboard.ai.testerSection.failure.forbidden";
  if (reply && !reply.ok && reply.error === "emoji_only") return "dashboard.ai.testerSection.failure.emojiOnly";
  if (reply && !reply.ok && reply.error === "rate_limited") return "dashboard.ai.testerSection.failure.tooMany";
  return "dashboard.ai.testerSection.failure.noAnswer";
}
