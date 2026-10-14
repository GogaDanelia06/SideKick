import { describe, it, expect } from "vitest";
import { message, textIn } from "@/lib/i18n/messages";
import { promptFailureText } from "./promptFailure";

const say = (result: Parameters<typeof promptFailureText>[0]) => textIn("en", promptFailureText(result));

describe("promptFailureText()", () => {
  it("names the real reason a prompt call failed", () => {
    expect(say({ ok: false, error: "failed", reason: "timeout", seconds: 280 })).toContain("280 seconds");
    expect(say({ ok: false, error: "failed", reason: "server_error", status: 502, seconds: 3 })).toContain("HTTP 502");
    expect(say({ ok: false, error: "failed", reason: "refused", status: 422, seconds: 1 })).toContain("HTTP 422");
    expect(say({ ok: false, error: "failed", reason: "unreachable", seconds: 0 })).toBe(message("en", "dashboard.ai.promptAiActions.failure.unreachable"));
    expect(say({ ok: false, error: "failed", reason: "empty_reply", seconds: 9 })).toBe(message("en", "dashboard.ai.promptAiActions.failure.emptyReply"));
  });

  it("falls back to the general message when there is no reason", () => {
    expect(say({ ok: false, error: "forbidden" })).toBe(message("en", "dashboard.ai.promptAiActions.theAiServiceDid"));
  });
});
