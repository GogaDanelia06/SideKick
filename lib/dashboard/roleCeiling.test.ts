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

import { addTeamMember, removeTeamMember, updateMemberRole } from "./actions";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { checkLimit } from "@/lib/billing/limits";

const asRole = (role: string) =>
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role });

/** The row the action is being pointed at. */
const target = (role: string, userId = "u2") =>
  vi.mocked(prisma.membership.findFirst).mockResolvedValue({
    id: "m2",
    userId,
    businessId: "b1",
    role,
  } as never);

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

/**
 * The coup this prevents, in one sentence: `team:manage` is held by ADMIN as
 * well as OWNER, so without a ceiling any admin the merchant hires can set
 * their own row to OWNER, take the billing rights the matrix withholds, and
 * then remove the person whose business it is.
 */
describe("role ceiling", () => {
  describe("updateMemberRole()", () => {
    it("refuses an admin granting a role above their own", async () => {
      target("OPERATOR");

      await expect(updateMemberRole("m2", "OWNER")).resolves.toEqual({
        ok: false,
        error: "forbidden",
      });
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });

    it("refuses an admin demoting someone who outranks them", async () => {
      // The same coup in two moves: demote the owner first, promote yourself after.
      target("OWNER");

      await expect(updateMemberRole("m2", "VIEWER")).resolves.toEqual({
        ok: false,
        error: "forbidden",
      });
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });

    it("lets an admin move somebody at or below their rank", async () => {
      target("VIEWER");

      await expect(updateMemberRole("m2", "OPERATOR")).resolves.toEqual({ ok: true });
      expect(prisma.membership.update).toHaveBeenCalled();
    });

    it("lets an owner hand the business over", async () => {
      // Owner handover must keep working: the rule is "above", not "at or above".
      asRole("OWNER");
      target("ADMIN");

      await expect(updateMemberRole("m2", "OWNER")).resolves.toEqual({ ok: true });
    });

    it("refuses a role that is not a role", async () => {
      // Server action arguments arrive with their types erased, so the `Role`
      // annotation guarantees nothing — junk used to reach Prisma and throw.
      target("VIEWER");

      await expect(updateMemberRole("m2", "SUPERUSER" as never)).resolves.toEqual({
        ok: false,
        error: "bad_role",
      });
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });
  });

  describe("removeTeamMember()", () => {
    it("refuses an admin removing an owner", async () => {
      target("OWNER");

      await expect(removeTeamMember("m2")).resolves.toEqual({ ok: false, error: "forbidden" });
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
      // Escalation one step removed: invite an owner, then sign in as them.
      await expect(addTeamMember(invite("OWNER"))).resolves.toEqual({
        ok: false,
        error: "forbidden",
      });
      expect(prisma.membership.create).not.toHaveBeenCalled();
    });

    it("refuses a role that is not a role", async () => {
      await expect(addTeamMember(invite("root"))).resolves.toEqual({
        ok: false,
        error: "bad_role",
      });
    });
  });
});
