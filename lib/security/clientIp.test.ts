import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { rateLimitHit: {} } }));
vi.mock("@/lib/logger", () => ({ log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { clientIp } from "./rateLimit";

describe("clientIp()", () => {
  const req = (headers: Record<string, string>) => new Request("http://x", { headers });

  it("takes the first entry of x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("trims whitespace", () => {
    expect(clientIp(req({ "x-forwarded-for": "  9.9.9.9  , 1.1.1.1" }))).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8");
  });

  it("returns 'unknown' when no ip header is present", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
