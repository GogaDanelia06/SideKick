import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: { channel: { findMany: vi.fn(), update: vi.fn() } },
}));
vi.mock("./instagramToken", () => ({ refreshLongLived: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { refreshInstagramTokens } from "./instagramRefresh";
import { prisma } from "@/lib/db";
import { refreshLongLived } from "./instagramToken";

const find = vi.mocked(prisma.channel.findMany);
const update = vi.mocked(prisma.channel.update);
const refresh = vi.mocked(refreshLongLived);

const NOW = new Date("2026-09-09T03:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

/** Obtained long ago, so age never gets in the way unless a test says so. */
const channel = (over: Record<string, unknown> = {}) => ({
  id: "ch1",
  businessId: "b1",
  accessToken: "IGA-old",
  tokenExpiresAt: new Date(NOW.getTime() + 10 * DAY),
  lastSyncAt: new Date(NOW.getTime() - 50 * DAY),
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  update.mockResolvedValue({} as never);
});

describe("refreshInstagramTokens()", () => {
  it("renews a token that is close to expiry and stores the new date", async () => {
    find.mockResolvedValue([channel()] as never);
    const expiresAt = new Date(NOW.getTime() + 60 * DAY);
    refresh.mockResolvedValue({ token: "IGA-new", expiresAt });

    const report = await refreshInstagramTokens(NOW);

    expect(report).toEqual({ considered: 1, renewed: 1, failed: 0 });
    expect(update).toHaveBeenCalledWith({
      where: { id: "ch1" },
      data: { accessToken: "IGA-new", tokenExpiresAt: expiresAt, lastSyncAt: NOW },
    });
  });

  it("only asks for tokens that are still alive and near the end", async () => {
    // Renewing is impossible once a token has lapsed, so an already-dead one is
    // not worth a call — and one with months left would be renewed nightly.
    find.mockResolvedValue([] as never);
    await refreshInstagramTokens(NOW);

    const where = find.mock.calls[0]![0]!.where as Record<string, unknown>;
    expect(where.type).toBe("INSTAGRAM");
    expect(where.connected).toBe(true);
    expect(where.tokenExpiresAt).toMatchObject({ gt: NOW });
  });

  it("skips a token Meta considers too young to renew", async () => {
    // Meta refuses anything under 24 hours old. Calling anyway would fail every
    // night and read like a broken integration.
    find.mockResolvedValue([channel({ lastSyncAt: new Date(NOW.getTime() - 60 * 60 * 1000) })] as never);

    const report = await refreshInstagramTokens(NOW);

    expect(refresh).not.toHaveBeenCalled();
    expect(report).toEqual({ considered: 1, renewed: 0, failed: 0 });
  });

  it("counts a refusal and leaves the old token in place", async () => {
    // The old one may still have days left; replacing it with nothing would
    // turn a warning into an outage.
    find.mockResolvedValue([channel()] as never);
    refresh.mockResolvedValue(null);

    const report = await refreshInstagramTokens(NOW);

    expect(update).not.toHaveBeenCalled();
    expect(report).toEqual({ considered: 1, renewed: 0, failed: 1 });
  });

  it("carries on through the rest when one channel fails", async () => {
    find.mockResolvedValue([channel({ id: "a" }), channel({ id: "b" })] as never);
    refresh
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ token: "IGA-new", expiresAt: new Date(NOW.getTime() + 60 * DAY) });

    expect(await refreshInstagramTokens(NOW)).toEqual({ considered: 2, renewed: 1, failed: 1 });
  });
});
