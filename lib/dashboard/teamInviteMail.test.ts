import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn() }, business: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/auth/passwordReset", () => ({ createResetToken: vi.fn() }));
vi.mock("@/lib/auth/providers", () => ({ googleSignInEnabled: () => true }));
vi.mock("@/lib/mail/send", () => ({ sendMail: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { sendTeamInvite } from "./teamInviteMail";
import { prisma } from "@/lib/db";
import { createResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";

const member = (over: Record<string, unknown> = {}) => ({
  email: "nino@example.com",
  name: "Nino",
  passwordHash: null,
  _count: { accounts: 0 },
  ...over,
});

const sentMail = () => vi.mocked(sendMail).mock.calls[0]![0];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockImplementation(((args: { where: { id: string } }) =>
    Promise.resolve(args.where.id === "owner" ? { name: "Goga", email: "g@example.com" } : member())) as never);
  vi.mocked(prisma.business.findUnique).mockResolvedValue({ name: "Cafe" } as never);
  vi.mocked(createResetToken).mockResolvedValue({ token: "t".repeat(64) } as never);
  vi.mocked(sendMail).mockResolvedValue({ sent: true });
});

describe("sendTeamInvite()", () => {
  it("gives someone with no way in a week-long link to set a password", async () => {
    expect(await sendTeamInvite("u2", "b1", "owner")).toBe(true);

    expect(createResetToken).toHaveBeenCalledWith("nino@example.com", 7 * 24 * 60);
    expect(sentMail().to).toBe("nino@example.com");
    expect(sentMail().text).toContain(`/reset?token=${"t".repeat(64)}`);
    expect(sentMail().text).toContain("„Cafe“");
    expect(sentMail().text).toContain("Goga");
  });

  it("sends someone who can already sign in to the login page, with no password link", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(member({ passwordHash: "hash" }) as never);

    await sendTeamInvite("u2", "b1", "owner");

    expect(createResetToken).not.toHaveBeenCalled();
    expect(sentMail().text).toContain("/login");
    expect(sentMail().text).not.toContain("/reset");
  });

  it("treats a Google-only account as one that can already sign in", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(member({ _count: { accounts: 1 } }) as never);

    await sendTeamInvite("u2", "b1", "owner");

    expect(createResetToken).not.toHaveBeenCalled();
  });

  it("reports a message the mail provider did not take", async () => {
    vi.mocked(sendMail).mockResolvedValue({ sent: false });
    expect(await sendTeamInvite("u2", "b1", "owner")).toBe(false);
  });
});
