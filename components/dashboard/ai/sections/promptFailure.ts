import type { PromptResult } from "@/lib/dashboard/actions/assistant";
import { phrase, type Text } from "@/lib/i18n/messages";

type Failure = Extract<PromptResult, { ok: false }>;

const BASE = "dashboard.ai.promptAiActions.failure";

export function promptFailureText(result: Failure): Text {
  const status = result.status ?? "—";
  switch (result.reason) {
    case "timeout":
      return phrase(`${BASE}.timeout`, { seconds: result.seconds ?? 0 });
    case "server_error":
      return phrase(`${BASE}.serverError`, { status });
    case "refused":
      return result.status === 422 ? `${BASE}.rephrase` : phrase(`${BASE}.refused`, { status });
    case "unreachable":
      return `${BASE}.unreachable`;
    case "bad_reply":
    case "empty_reply":
      return `${BASE}.emptyReply`;
    default:
      return "dashboard.ai.promptAiActions.theAiServiceDid";
  }
}
