import { describe, it, expect, beforeEach } from "vitest";
import { issueState, readState } from "./oauthState";

const MIN = 60_000;

beforeEach(() => {
  process.env.AUTH_SECRET = "state-signing-secret";
});

describe("issueState() / readState()", () => {
  it("reads back the business it was issued for", () => {
    expect(readState(issueState("biz_1"))).toEqual({ businessId: "biz_1" });
  });

  it("gives a different value every time", () => {
    // Two attempts from one business must not share a state, or a captured
    // link could be replayed as a later one.
    expect(issueState("biz_1")).not.toBe(issueState("biz_1"));
  });

  it("refuses a business id swapped into a valid state", () => {
    // The attack this exists for: attach an attacker's Instagram account to
    // somebody else's business by editing the state they were handed.
    const good = issueState("biz_1");
    const payload = Buffer.from(JSON.stringify({ b: "biz_2", n: "x", t: Date.now() })).toString(
      "base64url",
    );
    expect(readState(`${payload}.${good.split(".")[1]}`)).toBeNull();
  });

  it("refuses a state signed with a different secret", () => {
    const other = issueState("biz_1");
    process.env.AUTH_SECRET = "a-different-deployment";
    expect(readState(other)).toBeNull();
  });

  it("expires after fifteen minutes", () => {
    const now = Date.now();
    const state = issueState("biz_1", now);

    expect(readState(state, now + 14 * MIN)).not.toBeNull();
    expect(readState(state, now + 16 * MIN)).toBeNull();
  });

  it("does not expire anything when the clock has gone backwards", () => {
    const now = Date.now();
    expect(readState(issueState("biz_1", now), now - 60 * MIN)).not.toBeNull();
  });

  it("returns null for junk instead of throwing", () => {
    for (const junk of [null, "", "no-dot", ".", "abc.def", "!!!.!!!"]) {
      expect(readState(junk)).toBeNull();
    }
  });
});
