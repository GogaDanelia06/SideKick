import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    passwordResetToken: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

import { createResetToken, verifyResetToken } from "./passwordReset";
import { prisma } from "@/lib/db";

const userFind = vi.mocked(prisma.user.findUnique);
const tokUpdateMany = vi.mocked(prisma.passwordResetToken.updateMany);
const tokCreate = vi.mocked(prisma.passwordResetToken.create);
const tokFind = vi.mocked(prisma.passwordResetToken.findUnique);

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

beforeEach(() => vi.clearAllMocks());

describe("createResetToken()", () => {
  it("returns null for an unknown address (no enumeration)", async () => {
    userFind.mockResolvedValue(null);
    expect(await createResetToken("ghost@example.com")).toBeNull();
    expect(tokCreate).not.toHaveBeenCalled();
  });

  it("stores only a hash of the token, never the raw value", async () => {
    userFind.mockResolvedValue({ id: "u1", email: "a@b.com", name: "A" } as never);
    const issued = await createResetToken("a@b.com");
    expect(issued).not.toBeNull();

    const stored = tokCreate.mock.calls[0]![0].data.tokenHash;
    expect(stored).toBe(sha256(issued!.token));
    expect(stored).not.toBe(issued!.token);
  });

  it("invalidates any previously issued unused token first", async () => {
    userFind.mockResolvedValue({ id: "u1", email: "a@b.com", name: "A" } as never);
    await createResetToken("a@b.com");
    expect(tokUpdateMany).toHaveBeenCalledWith({
      where: { userId: "u1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(tokUpdateMany.mock.invocationCallOrder[0]!).toBeLessThan(
      tokCreate.mock.invocationCallOrder[0]!,
    );
  });

  it("issues a token that expires in the future", async () => {
    userFind.mockResolvedValue({ id: "u1", email: "a@b.com", name: "A" } as never);
    const issued = await createResetToken("a@b.com");
    expect(issued!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("looks the user up by a normalised email", async () => {
    userFind.mockResolvedValue({ id: "u1", email: "a@b.com", name: "A" } as never);
    await createResetToken("  A@B.COM ");
    expect(userFind).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "a@b.com" } }),
    );
  });
});

describe("verifyResetToken()", () => {
  const raw = "f".repeat(64);
  const record = {
    id: "t1",
    userId: "u1",
    tokenHash: sha256(raw),
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    user: { id: "u1", email: "a@b.com" },
  };

  it("accepts a valid, unused, unexpired token", async () => {
    tokFind.mockResolvedValue(record as never);
    expect(await verifyResetToken(raw)).toEqual(record);
  });

  it("rejects an unknown token", async () => {
    tokFind.mockResolvedValue(null);
    expect(await verifyResetToken(raw)).toBeNull();
  });

  it("rejects an already-used token", async () => {
    tokFind.mockResolvedValue({ ...record, usedAt: new Date() } as never);
    expect(await verifyResetToken(raw)).toBeNull();
  });

  it("rejects an expired token", async () => {
    tokFind.mockResolvedValue({ ...record, expiresAt: new Date(Date.now() - 1000) } as never);
    expect(await verifyResetToken(raw)).toBeNull();
  });

  it("rejects a too-short token without hitting the database", async () => {
    expect(await verifyResetToken("short")).toBeNull();
    expect(tokFind).not.toHaveBeenCalled();
  });

  it("looks the token up by its hash, not its raw value", async () => {
    tokFind.mockResolvedValue(record as never);
    await verifyResetToken(raw);
    expect(tokFind).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tokenHash: sha256(raw) } }),
    );
  });
});
