import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ unstable_update: vi.fn(async () => null) }));
vi.mock("@/lib/db", () => ({
  prisma: {
    membership: { findUnique: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    payment: { count: vi.fn() },
    business: { delete: vi.fn() },
  },
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), error: vi.fn() } }));

import { deleteBusiness } from "./deleteBusiness";
import { unstable_update } from "@/auth";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";

const remove = vi.mocked(prisma.business.delete);
const membership = vi.mocked(prisma.membership.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
  // Signed in to b1; deleting b2, a spare business they own alone, with no payments.
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" });
  membership.mockResolvedValue({ role: "OWNER", business: { name: "Second shop" } } as never);
  vi.mocked(prisma.membership.findFirst).mockResolvedValue({ businessId: "b1" } as never);
  vi.mocked(prisma.membership.count).mockResolvedValue(0);
  vi.mocked(prisma.payment.count).mockResolvedValue(0);
});

describe("deleteBusiness()", () => {
  it("deletes a spare business once its name is typed, leaving the session where it is", async () => {
    expect(await deleteBusiness("b2", "  Second shop ")).toEqual({ ok: true });
    expect(remove).toHaveBeenCalledWith({ where: { id: "b2" } });
    expect(unstable_update).not.toHaveBeenCalled();
  });

  it("moves the session to the oldest business left when the open one is deleted", async () => {
    vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b2", role: "OWNER" });
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({ businessId: "b1" } as never);

    expect(await deleteBusiness("b2", "Second shop")).toEqual({ ok: true });
    expect(unstable_update).toHaveBeenCalledWith({ user: { businessId: "b1" } });
    expect(prisma.membership.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1", businessId: { not: "b2" } }, orderBy: { createdAt: "asc" } }),
    );
  });

  const cases: [string, () => void, string, string?][] = [
    ["a member who is not the owner", () => void membership.mockResolvedValue({ role: "ADMIN", business: { name: "Second shop" } } as never), "forbidden"],
    ["a business they are not in", () => void membership.mockResolvedValue(null), "forbidden"],
    ["a name that does not match", () => undefined, "confirm", "Second"],
    ["their only business", () => void vi.mocked(prisma.membership.findFirst).mockResolvedValue(null), "last"],
    ["a business teammates still work in", () => void vi.mocked(prisma.membership.count).mockResolvedValue(2), "members"],
    ["a business with payments on record", () => void vi.mocked(prisma.payment.count).mockResolvedValue(1), "paid"],
  ];
  it.each(cases)("refuses %s, deleting nothing", async (_, arrange, error, typed = "Second shop") => {
    arrange();
    expect(await deleteBusiness("b2", typed)).toEqual({ ok: false, error });
    expect(remove).not.toHaveBeenCalled();
  });

  it("counts paid payments and ones still at the bank, not abandoned ones", async () => {
    await deleteBusiness("b2", "Second shop");
    const { where } = vi.mocked(prisma.payment.count).mock.calls[0]![0]!;
    expect(where).toMatchObject({ businessId: "b2", OR: [{ status: "PAID" }, { status: "PENDING" }] });
    const since = (where!.OR as { date?: { gte: Date } }[])[1]!.date!.gte;
    expect(Date.now() - since.getTime()).toBeCloseTo(24 * 60 * 60 * 1000, -4);
  });

  it("refuses without a session and reports a database failure instead of throwing", async () => {
    remove.mockRejectedValueOnce(new Error("foreign key"));
    expect(await deleteBusiness("b2", "Second shop")).toEqual({ ok: false, error: "failed" });

    vi.mocked(getContext).mockResolvedValue(null);
    expect(await deleteBusiness("b2", "Second shop")).toEqual({ ok: false, error: "unauthorized" });
  });
});
