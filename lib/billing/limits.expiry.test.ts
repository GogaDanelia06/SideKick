import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: { subscription: { findUnique: vi.fn() }, channel: { count: vi.fn() } },
}));

import { checkLimit } from "./limits";
import { prisma } from "@/lib/db";

const sub = vi.mocked(prisma.subscription.findUnique);
const DAY = 24 * 60 * 60 * 1000;

const plan = { name: "პრემიუმი", msgLimit: 1000, channelCap: 5, userCap: 5, productCap: 100 };
const row = (renewsAt: Date | null, msgUsed = 0) => ({ msgUsed, renewsAt, plan }) as never;

beforeEach(() => vi.clearAllMocks());

describe("checkLimit('messages') and subscription expiry", () => {
  it("answers for a subscription still inside its period", async () => {
    sub.mockResolvedValue(row(new Date(Date.now() + 10 * DAY)));
    expect(await checkLimit("b1", "messages")).toEqual({ allowed: true });
  });

  it("keeps answering during the grace period", async () => {
    // A bank transfer clearing late is the ordinary case. Cutting the assistant
    // off for it costs the merchant customers, not us.
    sub.mockResolvedValue(row(new Date(Date.now() - 2 * DAY)));
    expect(await checkLimit("b1", "messages")).toEqual({ allowed: true });
  });

  it("stops once the grace period is over", async () => {
    sub.mockResolvedValue(row(new Date(Date.now() - 30 * DAY)));
    const v = await checkLimit("b1", "messages");

    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe("expired");
  });

  it("reports a spent allowance as `limit`, not `expired`", async () => {
    // The two send the merchant to different places — upgrade versus renew —
    // so they must never be reported as the same thing.
    sub.mockResolvedValue(row(new Date(Date.now() + 10 * DAY), 1000));
    const v = await checkLimit("b1", "messages");

    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe("limit");
  });

  it("never expires a trial that has no renewal date", async () => {
    sub.mockResolvedValue(row(null));
    expect(await checkLimit("b1", "messages")).toEqual({ allowed: true });
  });

  it("leaves the dashboard alone — expiry stops the assistant, not the account", async () => {
    // The merchant still owns their conversations, their team and their
    // products. Locking them out of their own records punishes the wrong thing.
    sub.mockResolvedValue(row(new Date(Date.now() - 30 * DAY)));
    vi.mocked(prisma.channel.count).mockResolvedValue(1 as never);

    expect(await checkLimit("b1", "channels")).toEqual({ allowed: true });
  });
});
