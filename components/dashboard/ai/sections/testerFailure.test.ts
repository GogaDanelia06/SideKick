import { describe, it, expect } from "vitest";
import { textIn } from "@/lib/i18n/messages";
import type { TestFailure, TestReply } from "@/lib/dashboard/actions/assistant";
import { testerFailure } from "./testerFailure";

const failed = (why: TestFailure, extra: object = {}): TestReply => ({ ok: false, error: "failed", why, ...extra });

const ALL: TestFailure[] = [
  "unconfigured", "timeout", "unreachable", "refused", "server_error", "bad_reply", "empty_reply", "emoji_only", "unexpected",
];

describe("testerFailure()", () => {
  it("has plain words in both languages for every way the tester can fail", () => {
    for (const why of ALL) {
      const { message } = testerFailure(failed(why, { status: 500 }));
      for (const locale of ["ka", "en"] as const) {
        const text = textIn(locale, message);
        expect(text, `${why} in ${locale}`).not.toMatch(/^dashboard\./);
        expect(text, `${why} in ${locale}`).not.toContain("{");
      }
    }
  });

  it("puts the status the AI service answered with into the message and the code", () => {
    const { message, code } = testerFailure(failed("server_error", { status: 500, waitedMs: 12_340 }));
    expect(textIn("en", message)).toBe("The AI service returned an error (HTTP 500).");
    expect(code).toBe("server_error · HTTP 500 · 12.3s");
  });

  it("calls a call that never returned what it is: the signature of the server being cut off", () => {
    const { message, code } = testerFailure(null);
    expect(textIn("en", message)).toContain("didn't respond");
    expect(code).toBe("no_response");
  });

  it("names a missing permission as that, not as an AI failure", () => {
    expect(testerFailure({ ok: false, error: "forbidden" }).code).toBe("forbidden");
  });
});
