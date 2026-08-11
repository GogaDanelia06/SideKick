import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() },
    membership: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));

import { addTeamMember } from "./actions";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { checkLimit } from "@/lib/billing/limits";

const form = (email: string, name = "") => {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("name", name);
  fd.set("role", "OPERATOR");
  return fd;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" });
  vi.mocked(checkLimit).mockResolvedValue({ allowed: true });
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.membership.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.user.create).mockResolvedValue({ id: "new" } as never);
  vi.mocked(prisma.membership.create).mockResolvedValue({} as never);
});

describe("addTeamMember", () => {
  /**
   * The account was created before the plan was checked, so hitting the user cap
   * left a User row with no membership — and registration refuses an address that
   * already exists, so that address could never be signed up again.
   */
  it("creates no account when the plan refuses the invitation", async () => {
    vi.mocked(checkLimit).mockResolvedValue({
      allowed: false,
      limit: 3,
      used: 3,
      planName: "Basic",
    });

    const result = await addTeamMember(form("new@example.com"));

    expect(result).toEqual({ ok: false, error: "plan_limit" });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.membership.create).not.toHaveBeenCalled();
  });

  /** An invited colleague has no password; left unverified they could never sign
   *  in, and there is no route that reissues a confirmation link. */
  it("marks an invited account verified so it can be signed into", async () => {
    await addTeamMember(form("new@example.com", "Nino"));

    expect(prisma.user.create).toHaveBeenCalledOnce();
    const data = vi.mocked(prisma.user.create).mock.calls[0]![0].data as Record<string, unknown>;
    expect(data.emailVerified).toBeInstanceOf(Date);
    expect(data.email).toBe("new@example.com");
  });

  /** The old `upsert` wrote `name` on the update branch, which let the owner of
   *  one business rename a person belonging to another. */
  it("never renames somebody who already has an account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as never);

    const result = await addTeamMember(form("taken@example.com", "whatever the owner typed"));

    expect(result).toEqual({ ok: true });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.membership.create).toHaveBeenCalledWith({
      data: { userId: "existing", businessId: "b1", role: "OPERATOR" },
    });
  });

  it("reports an existing member rather than blaming the plan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as never);
    vi.mocked(prisma.membership.findUnique).mockResolvedValue({ id: "m1" } as never);

    expect(await addTeamMember(form("taken@example.com"))).toEqual({
      ok: false,
      error: "already_member",
    });
    expect(checkLimit).not.toHaveBeenCalled();
  });

  it("refuses a caller whose role cannot manage the team", async () => {
    vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OPERATOR" });

    expect(await addTeamMember(form("new@example.com"))).toEqual({
      ok: false,
      error: "forbidden",
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
