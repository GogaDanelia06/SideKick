import type { TestReply } from "@/lib/dashboard/actions/assistant";
import type { Text } from "@/lib/i18n/messages";

/**
 * What the tester tells the person when there is no answer. Only two reasons are theirs to
 * act on — no permission, and an answer that was all emoji while emoji are switched off.
 * Everything else is "try again": why it happened is in the server log, not on the screen.
 */
export function testerFailure(reply: TestReply | null): Text {
  if (reply && !reply.ok && reply.error === "forbidden") return "dashboard.ai.testerSection.failure.forbidden";
  if (reply && !reply.ok && reply.error === "emoji_only") return "dashboard.ai.testerSection.failure.emojiOnly";
  return "dashboard.ai.testerSection.failure.noAnswer";
}
