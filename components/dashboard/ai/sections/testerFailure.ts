import type { TestFailure, TestReply } from "@/lib/dashboard/actions/assistant";
import { phrase, type MessageKey, type Text } from "@/lib/i18n/messages";

const WHY: Record<TestFailure, MessageKey> = {
  unconfigured: "dashboard.ai.testerSection.failure.unconfigured",
  timeout: "dashboard.ai.testerSection.failure.timeout",
  unreachable: "dashboard.ai.testerSection.failure.unreachable",
  refused: "dashboard.ai.testerSection.failure.refused",
  server_error: "dashboard.ai.testerSection.failure.serverError",
  bad_reply: "dashboard.ai.testerSection.failure.badReply",
  empty_reply: "dashboard.ai.testerSection.failure.badReply",
  emoji_only: "dashboard.ai.testerSection.failure.emojiOnly",
  unexpected: "dashboard.ai.testerSection.failure.unexpected",
};

/**
 * What the tester says when it has no answer, and a short code to quote when asking for help.
 * `null` is a call that never came back at all — the signature of the server being cut off
 * (a platform time limit) rather than of the AI service answering badly.
 */
export function testerFailure(reply: TestReply | null): { message: Text; code: string } {
  if (reply === null) return { message: "dashboard.ai.testerSection.failure.noResponse", code: "no_response" };
  if (reply.ok) return { message: WHY.unexpected, code: "unexpected" };
  if (reply.error === "forbidden") return { message: "dashboard.ai.testerSection.failure.forbidden", code: "forbidden" };
  if (reply.error !== "failed") return { message: WHY[reply.error === "unconfigured" ? "unconfigured" : "unexpected"], code: reply.error };

  const seconds = reply.waitedMs ? ` · ${(reply.waitedMs / 1000).toFixed(1)}s` : "";
  return {
    message: reply.status ? phrase(WHY[reply.why] as MessageKey, { status: reply.status }) : WHY[reply.why],
    code: `${reply.why}${reply.status ? ` · HTTP ${reply.status}` : ""}${seconds}`,
  };
}
