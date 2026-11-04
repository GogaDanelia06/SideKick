import { describe, expect, it } from "vitest";
import { bearerToken, safeEqual } from "./safeEqual";

const withAuth = (value?: string) =>
  new Request("https://sidekick.test/api", value ? { headers: { authorization: value } } : {});

describe("safeEqual()", () => {
  it("accepts the exact secret", () => {
    expect(safeEqual("verify-me-please", "verify-me-please")).toBe(true);
  });

  it("rejects a different or truncated secret", () => {
    expect(safeEqual("verify-me-pleas", "verify-me-please")).toBe(false);
    expect(safeEqual("VERIFY-ME-PLEASE", "verify-me-please")).toBe(false);
    expect(safeEqual("", "verify-me-please")).toBe(false);
  });
});

describe("bearerToken()", () => {
  it("reads the token after the Bearer prefix", () => {
    expect(bearerToken(withAuth("Bearer  abc123 "))).toBe("abc123");
  });

  it("returns nothing for a missing or different scheme", () => {
    expect(bearerToken(withAuth())).toBe("");
    expect(bearerToken(withAuth("Basic abc123"))).toBe("");
  });
});
