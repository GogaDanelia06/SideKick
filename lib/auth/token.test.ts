import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    membership: { findFirst: vi.fn(), findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/logger", () => ({ log: { error: vi.fn() } }));

import { stampSignIn, switchTokenBusiness } from "./token";
import { prisma } from "@/lib/db";

const findMembership = vi.mocked(prisma.membership.findUnique);
const signedIn = () => ({ uid: "u1", businessId: "b1", role: "OWNER" });

beforeEach(() => vi.clearAllMocks());

describe("stampSignIn()", () => {
  it("opens the oldest business and records the admin flag", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValue({ businessId: "b1", role: "OWNER" } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isAdmin: true } as never);

    const token = await stampSignIn({}, { id: "u1", remember: true });

    expect(token).toMatchObject({ uid: "u1", remember: true, businessId: "b1", role: "OWNER", isAdmin: true });
    expect(token.startedAt).toEqual(expect.any(Number));
    expect(prisma.membership.findFirst).toHaveBeenCalledWith({ where: { userId: "u1" }, orderBy: { createdAt: "asc" } });
  });
});

describe("switchTokenBusiness()", () => {
  it("moves into a business the user belongs to, with their role there", async () => {
    findMembership.mockResolvedValue({ role: "VIEWER" } as never);

    expect(await switchTokenBusiness(signedIn(), "b2")).toMatchObject({ uid: "u1", businessId: "b2", role: "VIEWER" });
    expect(findMembership).toHaveBeenCalledWith({
      where: { userId_businessId: { userId: "u1", businessId: "b2" } },
      select: { role: true },
    });
  });

  it("stays put for a business the user is not a member of", async () => {
    findMembership.mockResolvedValue(null);
    expect(await switchTokenBusiness(signedIn(), "someone-elses")).toMatchObject({ businessId: "b1", role: "OWNER" });
  });

  it("ignores anything but a business id, and a token without a user", async () => {
    for (const value of [undefined, 42, { id: "b2" }]) {
      expect(await switchTokenBusiness(signedIn(), value)).toMatchObject({ businessId: "b1" });
    }
    expect(await switchTokenBusiness({}, "b2")).toEqual({});
    expect(findMembership).not.toHaveBeenCalled();
  });

  it("keeps the session when the database fails; throwing would sign the user out", async () => {
    findMembership.mockRejectedValue(new Error("down"));
    expect(await switchTokenBusiness(signedIn(), "b2")).toMatchObject({ businessId: "b1", role: "OWNER" });
  });
});
