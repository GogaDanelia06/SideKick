import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();
const updateMany = vi.fn();
const update = vi.fn();
const deleteMany = vi.fn();
const userUpdate = vi.fn();
const transaction = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    emailVerificationToken: {
      findUnique: (...a: unknown[]) => findUnique(...a),
      create: (...a: unknown[]) => create(...a),
      updateMany: (...a: unknown[]) => updateMany(...a),
      update: (...a: unknown[]) => update(...a),
      deleteMany: (...a: unknown[]) => deleteMany(...a),
    },
    user: { update: (...a: unknown[]) => userUpdate(...a) },
    $transaction: (...a: unknown[]) => transaction(...a),
  },
}));

const {
  createVerificationToken,
  verifyVerificationToken,
  consumeVerificationToken,
} = await import("./emailVerification");

import { createHash } from "node:crypto";
const sha = (t: string) => createHash("sha256").update(t).digest("hex");

const future = () => new Date(Date.now() + 60 * 60_000);
const past = () => new Date(Date.now() - 1000);

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue({});
  updateMany.mockResolvedValue({ count: 0 });
  transaction.mockResolvedValue([]);
});

describe("createVerificationToken", () => {
  it("never stores the token itself, only its hash", async () => {
    const { token } = await createVerificationToken("u1");
    const stored = (create.mock.calls[0]![0] as { data: { tokenHash: string } }).data;
    // A database leak must not hand anyone a working link.
    expect(stored.tokenHash).toBe(sha(token));
    expect(stored.tokenHash).not.toBe(token);
  });

  it("issues something long enough not to be guessed", async () => {
    const { token } = await createVerificationToken("u1");
    expect(token).toHaveLength(64);
  });

  it("burns any earlier link, so a forwarded old mail stops working", async () => {
    await createVerificationToken("u1");
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("expires a day out, not an hour", async () => {
    const { expiresAt } = await createVerificationToken("u1");
    const hours = (expiresAt.getTime() - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(23);
    expect(hours).toBeLessThan(25);
  });
});

describe("verifyVerificationToken", () => {
  const valid = { id: "t1", tokenHash: sha("a".repeat(64)), usedAt: null, expiresAt: future(), user: { id: "u1" } };

  it("accepts a live token", async () => {
    findUnique.mockResolvedValue(valid);
    expect(await verifyVerificationToken("a".repeat(64))).toBe(valid);
  });

  it("rejects one that was already used", async () => {
    findUnique.mockResolvedValue({ ...valid, usedAt: new Date() });
    expect(await verifyVerificationToken("a".repeat(64))).toBeNull();
  });

  it("rejects one past its expiry", async () => {
    findUnique.mockResolvedValue({ ...valid, expiresAt: past() });
    expect(await verifyVerificationToken("a".repeat(64))).toBeNull();
  });

  it("rejects a token nobody issued", async () => {
    findUnique.mockResolvedValue(null);
    expect(await verifyVerificationToken("b".repeat(64))).toBeNull();
  });

  it("refuses a short token without touching the database", async () => {
    expect(await verifyVerificationToken("short")).toBeNull();
    expect(await verifyVerificationToken("")).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe("consumeVerificationToken", () => {
  it("burns the token and verifies the user in one transaction", async () => {
    // Half-applied is the worst case: a spent token on an unverified account,
    // or a verified account with a live link still in someone's inbox.
    await consumeVerificationToken("t1", "u1");
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { usedAt: expect.any(Date) } });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { emailVerified: expect.any(Date) },
    });
  });
});
