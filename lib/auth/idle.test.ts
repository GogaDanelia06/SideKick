import { describe, it, expect } from "vitest";
import { IDLE_MAX_SEC, isIdle, needsRefresh, readMarker, stampMarker } from "./idle";

const SECRET = "auth-secret-for-tests";
const MIN = 60_000;

describe("stampMarker() / readMarker()", () => {
  it("reads back the time it stamped", async () => {
    const now = Date.UTC(2026, 7, 12, 9, 0, 0);
    expect(await readMarker(await stampMarker(SECRET, now), SECRET)).toBe(now);
  });

  it("refuses a timestamp somebody edited", async () => {
    // The point of signing it. Without this the cookie is just a number the
    // browser owns, and anyone could set tomorrow's date and never time out.
    const marker = await stampMarker(SECRET, Date.now());
    const forged = `${Date.now() + 10 * 60 * 60 * 1000}.${marker.split(".")[1]}`;

    expect(await readMarker(forged, SECRET)).toBeNull();
  });

  it("refuses a marker signed with a different secret", async () => {
    const marker = await stampMarker("some-other-deployment", Date.now());
    expect(await readMarker(marker, SECRET)).toBeNull();
  });

  it("returns null for a missing or malformed cookie rather than throwing", async () => {
    for (const junk of [undefined, "", "no-dot", ".", "abc.def", "12x3.aa"]) {
      expect(await readMarker(junk, SECRET)).toBeNull();
    }
  });
});

describe("isIdle()", () => {
  const now = Date.UTC(2026, 7, 12, 12, 0, 0);

  it("keeps a session that was used a minute ago", () => {
    expect(isIdle(now - 1 * MIN, now)).toBe(false);
  });

  it("keeps a session right up to the limit", () => {
    expect(isIdle(now - IDLE_MAX_SEC * 1000, now)).toBe(false);
  });

  it("ends a session that has been quiet past it", () => {
    expect(isIdle(now - (IDLE_MAX_SEC * 1000 + 1), now)).toBe(true);
  });

  it("ends a session left overnight", () => {
    expect(isIdle(now - 9 * 60 * MIN, now)).toBe(true);
  });

  it("expires nothing when the clock has gone backwards", () => {
    // A machine that resyncs its clock must not sign everyone out.
    expect(isIdle(now + 60 * MIN, now)).toBe(false);
  });
});

describe("needsRefresh()", () => {
  const now = Date.UTC(2026, 7, 12, 12, 0, 0);

  it("leaves a marker written seconds ago alone", () => {
    // Rewriting on every request would put a Set-Cookie on every navigation
    // for no gain.
    expect(needsRefresh(now - 5_000, now)).toBe(false);
  });

  it("rewrites one that is a few minutes old", () => {
    expect(needsRefresh(now - 5 * MIN, now)).toBe(true);
  });
});
