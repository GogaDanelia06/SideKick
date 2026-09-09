import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const channelCount = vi.fn();
const membershipCount = vi.fn();
const productCount = vi.fn();
const updateMany = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: (...a: unknown[]) => findUnique(...a),
      updateMany: (...a: unknown[]) => updateMany(...a),
    },
    channel: { count: (...a: unknown[]) => channelCount(...a) },
    membership: { count: (...a: unknown[]) => membershipCount(...a) },
    product: { count: (...a: unknown[]) => productCount(...a) },
  },
}));

const { checkLimit, countMessage } = await import("./limits");

/** A Basic-shaped plan: every cap small enough to hit in a test. */
function plan(over: Partial<Record<string, number>> = {}, msgUsed = 0) {
  return {
    msgUsed,
    plan: {
      name: "ბეისიქი",
      msgLimit: 1000,
      channelCap: 1,
      userCap: 1,
      productCap: 100,
      ...over,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  channelCount.mockResolvedValue(0);
  membershipCount.mockResolvedValue(0);
  productCount.mockResolvedValue(0);
});

describe("checkLimit", () => {
  it("allows a business with no subscription rather than locking it out", async () => {
    // A missing billing row is our data problem, not the customer's.
    findUnique.mockResolvedValue(null);
    expect(await checkLimit("b1", "products")).toEqual({ allowed: true });
  });

  it("allows while under the cap", async () => {
    findUnique.mockResolvedValue(plan());
    productCount.mockResolvedValue(99);
    expect(await checkLimit("b1", "products")).toEqual({ allowed: true });
  });

  it("blocks once the cap is reached", async () => {
    findUnique.mockResolvedValue(plan());
    productCount.mockResolvedValue(100);
    expect(await checkLimit("b1", "products")).toEqual({ allowed: false, reason: "limit" as const, limit: 100,
      used: 100,
      planName: "ბეისიქი",
    });
  });

  it("treats -1 as unlimited, which is how Premium is stored", async () => {
    findUnique.mockResolvedValue(plan({ productCap: -1 }));
    productCount.mockResolvedValue(50_000);
    expect(await checkLimit("b1", "products")).toEqual({ allowed: true });
  });

  it("counts only connected channels", async () => {
    findUnique.mockResolvedValue(plan());
    channelCount.mockResolvedValue(0);
    await checkLimit("b1", "channels");
    expect(channelCount).toHaveBeenCalledWith({
      where: { businessId: "b1", connected: true },
    });
  });

  it("blocks a second team member on a one-seat plan", async () => {
    findUnique.mockResolvedValue(plan());
    membershipCount.mockResolvedValue(1);
    const verdict = await checkLimit("b1", "users");
    expect(verdict.allowed).toBe(false);
  });

  it("reads message usage from the subscription, not a count query", async () => {
    findUnique.mockResolvedValue(plan({}, 1000));
    const verdict = await checkLimit("b1", "messages");
    expect(verdict).toEqual({ allowed: false, reason: "limit" as const, limit: 1000,
      used: 1000,
      planName: "ბეისიქი",
    });
  });

  it("scopes every count to the business asking", async () => {
    findUnique.mockResolvedValue(plan());
    await checkLimit("b-two", "products");
    expect(productCount).toHaveBeenCalledWith({ where: { businessId: "b-two" } });
  });
});

describe("countMessage", () => {
  it("increments rather than writing an absolute value", async () => {
    // Two concurrent replies must both land; a read-then-write would lose one.
    await countMessage("b1");
    expect(updateMany).toHaveBeenCalledWith({
      where: { businessId: "b1" },
      data: { msgUsed: { increment: 1 } },
    });
  });
});
