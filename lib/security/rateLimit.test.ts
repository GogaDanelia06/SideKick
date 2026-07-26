import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    rateLimitHit: {
      findMany: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));
vi.mock("@/lib/logger", () => ({
  log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { consume, clear, clientIp, tooManyRequestsMessage, LIMITS } from "./rateLimit";
import { prisma } from "@/lib/db";

const findMany = vi.mocked(prisma.rateLimitHit.findMany);
const create = vi.mocked(prisma.rateLimitHit.create);
const deleteMany = vi.mocked(prisma.rateLimitHit.deleteMany);

const NOW = new Date("2026-07-26T12:00:00.000Z").getTime();

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue({} as never);
  deleteMany.mockResolvedValue({ count: 0 } as never);
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function hits(n: number, oldestAgoSec: number) {
  return Array.from({ length: n }, (_, i) => ({
    createdAt: new Date(NOW - oldestAgoSec * 1000 + i * 1000),
  }));
}

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

describe("tooManyRequestsMessage()", () => {
  it("rounds the wait up to whole minutes", () => {
    expect(tooManyRequestsMessage(1)).toContain("1");
    expect(tooManyRequestsMessage(90)).toContain("2");
    expect(tooManyRequestsMessage(120)).toContain("2");
  });
});

describe("consume() — under the limit", () => {
  it("allows the request and records the attempt", async () => {
    findMany.mockResolvedValue([] as never);
    const r = await consume("login", "user@example.com");
    expect(r.ok).toBe(true);
    expect(create).toHaveBeenCalledOnce();
    expect(r.remaining).toBe(LIMITS.login.max - 1);
  });

  it("normalises the subject into the key (lowercased, trimmed)", async () => {
    findMany.mockResolvedValue([] as never);
    await consume("login", "  User@Example.COM ");
    expect(create).toHaveBeenCalledWith({ data: { key: "login:user@example.com" } });
  });

  it("counts down remaining as attempts accumulate", async () => {
    findMany.mockResolvedValue(hits(3, 60) as never);
    const r = await consume("login", "user@example.com");
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(LIMITS.login.max - 3 - 1);
  });
});

describe("consume() — at the limit", () => {
  it("blocks once the window is full and does NOT record another attempt", async () => {
    findMany.mockResolvedValue(hits(LIMITS.login.max, 60) as never);
    const r = await consume("login", "user@example.com");
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it("computes retry-after from the OLDEST attempt in the window", async () => {
    findMany.mockResolvedValue(hits(LIMITS.login.max, 60) as never);
    const r = await consume("login", "user@example.com");
    expect(r.retryAfterSec).toBe(LIMITS.login.windowSec - 60);
  });

  it("retry-after shrinks as the oldest attempt ages (window slides, not resets)", async () => {
    findMany.mockResolvedValue(hits(LIMITS.login.max, 800) as never);
    const r = await consume("login", "user@example.com");
    expect(r.retryAfterSec).toBe(LIMITS.login.windowSec - 800);
  });

  it("never reports a retry-after below 1 second", async () => {
    findMany.mockResolvedValue(hits(LIMITS.login.max, LIMITS.login.windowSec) as never);
    const r = await consume("login", "user@example.com");
    expect(r.retryAfterSec).toBeGreaterThanOrEqual(1);
  });
});

describe("consume() — fails open", () => {
  it("allows the request if the database is unreachable", async () => {
    findMany.mockRejectedValue(new Error("db down"));
    const r = await consume("login", "user@example.com");
    expect(r.ok).toBe(true);
  });
});

describe("clear()", () => {
  it("deletes every attempt recorded against the subject", async () => {
    await clear("login", "User@Example.com");
    expect(deleteMany).toHaveBeenCalledWith({ where: { key: "login:user@example.com" } });
  });

  it("swallows database errors (best-effort cleanup)", async () => {
    deleteMany.mockRejectedValueOnce(new Error("db down"));
    await expect(clear("login", "user@example.com")).resolves.toBeUndefined();
  });
});
