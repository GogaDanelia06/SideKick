import { describe, it, expect } from "vitest";
import { textIn } from "@/lib/i18n/messages";
import { testerFailure } from "./testerFailure";

describe("testerFailure()", () => {
  it("says only 'try again' when the AI did not answer, whatever the reason was", () => {
    for (const reply of [null, { ok: false, error: "failed" }, { ok: false, error: "unconfigured" }, { ok: false, error: "empty" }] as const) {
      expect(textIn("en", testerFailure(reply))).toBe("The AI service did not answer. Try again.");
    }
    expect(textIn("ka", testerFailure(null))).toBe("AI სერვისმა ვერ უპასუხა. სცადე ხელახლა.");
  });

  it("tells the person the two things they can do something about", () => {
    expect(textIn("en", testerFailure({ ok: false, error: "forbidden" }))).toContain("permission");
    expect(textIn("en", testerFailure({ ok: false, error: "emoji_only" }))).toContain("emoji are switched off");
  });

  /** The details are for whoever reads the log, never for a merchant. */
  it("has nothing technical in any message, in either language", () => {
    for (const reply of [null, { ok: false, error: "failed" }, { ok: false, error: "forbidden" }, { ok: false, error: "emoji_only" }] as const) {
      for (const locale of ["ka", "en"] as const) {
        expect(textIn(locale, testerFailure(reply))).not.toMatch(/HTTP|\b[45]\d\d\b|\d\.\ds|refused|timeout/i);
      }
    }
  });
});
