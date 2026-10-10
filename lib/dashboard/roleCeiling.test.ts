import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    membership: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));

import { removeTeamMember, updateMemberRole } from "./actions/team";
import { addTeamMember } from "./actions/teamInvite";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { checkLimit } from "@/lib/billing/limits";

const asRole = (role: string) =>
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role });

const target = (role: string, userId = "u2") =>
  vi.mocked(prisma.membership.findFirst).mockResolvedValue({
    id: "m2",
    userId,
    businessId: "b1",
    role,
  } as never);

const refused = (error: string) => ({ ok: false, error });

const invite = (role: string) => {
  const fd = new FormData();
  fd.set("email", "new@example.com");
  fd.set("role", role);
  return fd;
};

beforeEach(() => {
  vi.clearAllMocks();
  asRole("ADMIN");
  vi.mocked(checkLimit).mockResolvedValue({ allowed: true } as never);
  vi.mocked(prisma.membership.count).mockResolvedValue(2 as never);
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
});

describe("role ceiling", () => {
  describe("updateMemberRole()", () => {
    it("refuses an admin granting a role above their own", async () => {
      target("OPERATOR");

      await expect(updateMemberRole("m2", "OWNER")).resolves.toEqual(refused("forbidden"));
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });

    it("refuses an admin demoting someone who outranks them", async () => {
      target("OWNER");

      await expect(updateMemberRole("m2", "VIEWER")).resolves.toEqual(refused("forbidden"));
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });

    it("lets an admin move somebody at or below their rank", async () => {
      target("VIEWER");

      await expect(updateMemberRole("m2", "OPERATOR")).resolves.toEqual({ ok: true });
      expect(prisma.membership.update).toHaveBeenCalled();
    });

    it("lets an owner hand the business over", async () => {
      asRole("OWNER");
      target("ADMIN");

      await expect(updateMemberRole("m2", "OWNER")).resolves.toEqual({ ok: true });
    });

    it("refuses a role that is not a role", async () => {
      target("VIEWER");

      await expect(updateMemberRole("m2", "SUPERUSER" as never)).resolves.toEqual(refused("bad_role"));
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });
  });

  describe("removeTeamMember()", () => {
    it("refuses an admin removing an owner", async () => {
      target("OWNER");

      await expect(removeTeamMember("m2")).resolves.toEqual(refused("forbidden"));
      expect(prisma.membership.delete).not.toHaveBeenCalled();
    });

    it("lets an admin remove an operator", async () => {
      target("OPERATOR");

      await expect(removeTeamMember("m2")).resolves.toEqual({ ok: true });
      expect(prisma.membership.delete).toHaveBeenCalled();
    });
  });

  describe("addTeamMember()", () => {
    it("refuses an admin inviting an owner", async () => {
      await expect(addTeamMember(invite("OWNER"))).resolves.toEqual(refused("forbidden"));
      expect(prisma.membership.create).not.toHaveBeenCalled();
    });

    it("refuses a role that is not a role", async () => {
      await expect(addTeamMember(invite("root"))).resolves.toEqual(refused("bad_role"));
    });
  });
});
