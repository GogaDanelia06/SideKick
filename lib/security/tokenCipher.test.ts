import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { isSealed, openToken, sealToken } from "./tokenCipher";

const KEY = Buffer.alloc(32, 7).toString("base64");
const OTHER_KEY = Buffer.alloc(32, 9).toString("base64");
const TOKEN = "EAAGm0PX4ZCpsBA-page-token";

afterEach(() => vi.unstubAllEnvs());

describe("sealToken() / openToken()", () => {
  it("round-trips a token and never stores it readable", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    const stored = sealToken(TOKEN);
    expect(isSealed(stored)).toBe(true);
    expect(stored).not.toContain(TOKEN);
    expect(openToken(stored)).toBe(TOKEN);
  });

  it("seals the same token differently each time", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    expect(sealToken(TOKEN)).not.toBe(sealToken(TOKEN));
  });

  it("does not seal a sealed token twice", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    const once = sealToken(TOKEN);
    expect(sealToken(once)).toBe(once);
  });

  it("reads rows written before encryption as they are", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    expect(openToken(TOKEN)).toBe(TOKEN);
    expect(openToken(null)).toBeNull();
  });

  it("refuses a token that was tampered with", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    const stored = sealToken(TOKEN);
    const tampered = stored.slice(0, -4) + (stored.endsWith("AAAA") ? "BBBB" : "AAAA");
    expect(openToken(tampered)).toBeNull();
  });

  it("refuses a token sealed with another key", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", OTHER_KEY);
    const stored = sealToken(TOKEN);
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY);
    expect(openToken(stored)).toBeNull();
  });

  it("keeps working unencrypted when no usable key is set", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", "");
    expect(sealToken(TOKEN)).toBe(TOKEN);
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", "too-short");
    expect(sealToken(TOKEN)).toBe(TOKEN);
  });
});
