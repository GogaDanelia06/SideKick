import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    membership: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));
vi.mock("@/lib/security/rateLimit", () => ({ consume: vi.fn() }));
vi.mock("./teamInviteMail", () => ({ sendTeamInvite: vi.fn() }));

import { addTeamMember, resendTeamInvite } from "./actions/teamInvite";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { checkLimit } from "@/lib/billing/limits";
import { consume } from "@/lib/security/rateLimit";
import { sendTeamInvite } from "./teamInviteMail";

const form = () => {
  const fd = new FormData();
  fd.set("email", "new@example.com");
  fd.set("role", "OPERATOR");
  return fd;
};

const throttled = () => vi.mocked(consume).mockResolvedValue({ ok: false, remaining: 0, retryAfterSec: 60 });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" });
  vi.mocked(checkLimit).mockResolvedValue({ allowed: true });
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.membership.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.user.create).mockResolvedValue({ id: "new" } as never);
  vi.mocked(prisma.membership.create).mockResolvedValue({} as never);
  vi.mocked(prisma.membership.findFirst).mockResolvedValue({ userId: "u2" } as never);
  vi.mocked(consume).mockResolvedValue({ ok: true, remaining: 1, retryAfterSec: 0 });
  vi.mocked(sendTeamInvite).mockResolvedValue(true);
});

describe("team invitations", () => {
  it("emails the new member once they are added", async () => {
    expect(await addTeamMember(form())).toEqual({ ok: true, emailed: true });
    expect(sendTeamInvite).toHaveBeenCalledWith("new", "b1", "u1");
  });

  it("keeps the member but says so when the email could not be sent", async () => {
    vi.mocked(sendTeamInvite).mockResolvedValue(false);

    expect(await addTeamMember(form())).toEqual({ ok: true, emailed: false });
    expect(prisma.membership.create).toHaveBeenCalledOnce();
  });

  it("adds nobody when the business has sent too many invitations", async () => {
    throttled();

    expect(await addTeamMember(form())).toEqual({ ok: false, error: "too_many_invites" });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(sendTeamInvite).not.toHaveBeenCalled();
  });

  it("resends the invitation to a member of this business", async () => {
    expect(await resendTeamInvite("m2")).toEqual({ ok: true, emailed: true });
    expect(prisma.membership.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "m2", businessId: "b1" } }),
    );
    expect(sendTeamInvite).toHaveBeenCalledWith("u2", "b1", "u1");
  });

  it("reports a resend that did not go out", async () => {
    vi.mocked(sendTeamInvite).mockResolvedValue(false);
    expect(await resendTeamInvite("m2")).toEqual({ ok: false, error: "not_sent" });
  });

  it("refuses to resend to yourself, to strangers, or past the limit", async () => {
    vi.mocked(prisma.membership.findFirst).mockResolvedValueOnce({ userId: "u1" } as never);
    expect(await resendTeamInvite("m1")).toEqual({ ok: false, error: "forbidden" });

    vi.mocked(prisma.membership.findFirst).mockResolvedValueOnce(null);
    expect(await resendTeamInvite("other")).toEqual({ ok: false, error: "not_found" });

    throttled();
    expect(await resendTeamInvite("m2")).toEqual({ ok: false, error: "too_many_invites" });
    expect(sendTeamInvite).not.toHaveBeenCalled();
  });

  it("refuses a caller who cannot manage the team", async () => {
    vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OPERATOR" });
    expect(await resendTeamInvite("m2")).toEqual({ ok: false, error: "forbidden" });
  });
});
