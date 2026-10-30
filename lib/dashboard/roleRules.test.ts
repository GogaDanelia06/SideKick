import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { membership: { findFirst: vi.fn(), update: vi.fn(), count: vi.fn() } },
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));

import { updateMemberRole } from "./actions/team";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";

const me = (role: string) => vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role });

const member = (role: string, userId = "u2") =>
  vi.mocked(prisma.membership.findFirst).mockResolvedValue({ id: "m", userId, businessId: "b1", role } as never);

const forbidden = { ok: false, error: "forbidden" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.membership.count).mockResolvedValue(2 as never);
});

describe("who may change which role", () => {
  it("an admin cannot make themselves owner", async () => {
    me("ADMIN");
    member("ADMIN", "u1");

    await expect(updateMemberRole("m", "OWNER")).resolves.toEqual(forbidden);
    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("an admin cannot change an owner's role", async () => {
    me("ADMIN");
    member("OWNER");

    for (const role of ["ADMIN", "OPERATOR", "VIEWER"] as const) {
      await expect(updateMemberRole("m", role)).resolves.toEqual(forbidden);
    }
    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("an admin can make someone admin, operator or viewer", async () => {
    me("ADMIN");
    member("OPERATOR");

    for (const role of ["ADMIN", "OPERATOR", "VIEWER"] as const) {
      await expect(updateMemberRole("m", role)).resolves.toEqual({ ok: true });
    }
  });

  it.each(["OPERATOR", "VIEWER"])("a %s cannot change any role, not even their own", async (role) => {
    me(role);
    member(role, "u1");

    for (const wanted of ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] as const) {
      await expect(updateMemberRole("m", wanted)).resolves.toEqual(forbidden);
    }
    expect(prisma.membership.findFirst).not.toHaveBeenCalled();
  });
});
