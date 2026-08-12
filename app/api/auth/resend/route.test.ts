import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock("@/lib/auth/emailVerification", () => ({
  createVerificationToken: vi.fn().mockResolvedValue({ token: "tok_abc" }),
}));
vi.mock("@/lib/mail/send", () => ({ sendMail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/security/rateLimit", () => ({
  clientIp: () => "1.2.3.4",
  consume: vi.fn().mockResolvedValue({ ok: true, remaining: 2, retryAfterSec: 0 }),
  tooManyRequestsMessage: () => "too many",
}));

import { POST } from "./route";
import { prisma } from "@/lib/db";
import { createVerificationToken } from "@/lib/auth/emailVerification";
import { sendMail } from "@/lib/mail/send";
import { consume } from "@/lib/security/rateLimit";

const findUser = vi.mocked(prisma.user.findUnique);
const makeToken = vi.mocked(createVerificationToken);
const mail = vi.mocked(sendMail);
const limit = vi.mocked(consume);

const post = (email: unknown) =>
  POST(
    new Request("https://sidekick.ge/api/auth/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    }),
  );

const unverified = {
  id: "u1",
  email: "someone@example.com",
  name: "Someone",
  emailVerified: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  limit.mockResolvedValue({ ok: true, remaining: 2, retryAfterSec: 0 });
  mail.mockResolvedValue({ sent: true });
  makeToken.mockResolvedValue({ token: "tok_abc", expiresAt: new Date() });
});

describe("POST /api/auth/resend", () => {
  it("issues a fresh link for an account still waiting on confirmation", async () => {
    findUser.mockResolvedValue(unverified as never);
    const res = await post("someone@example.com");

    expect(res.status).toBe(200);
    expect(makeToken).toHaveBeenCalledWith("u1");
    expect(mail).toHaveBeenCalledOnce();
  });

  it("answers an unknown address exactly like a real one", async () => {
    // The whole point. Anything that differed here — status, body, wording —
    // would turn this into a way of asking which addresses have accounts.
    findUser.mockResolvedValue(null);
    const res = await post("nobody@example.com");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mail).not.toHaveBeenCalled();
  });

  it("stays silent about an account that is already confirmed", async () => {
    findUser.mockResolvedValue({ ...unverified, emailVerified: new Date() } as never);
    const res = await post("someone@example.com");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(makeToken).not.toHaveBeenCalled();
  });

  it("lowercases the address before looking it up", async () => {
    findUser.mockResolvedValue(unverified as never);
    await post("  SomeOne@Example.COM  ");

    expect(findUser).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "someone@example.com" } }),
    );
  });

  it("refuses something that is not an email", async () => {
    expect((await post("not-an-email")).status).toBe(400);
    expect(findUser).not.toHaveBeenCalled();
  });

  it("throttles repeated requests", async () => {
    // An endpoint that mails an address a stranger typed is a way to have us
    // deliver unwanted messages for them.
    limit.mockResolvedValue({ ok: false, remaining: 0, retryAfterSec: 900 });
    const res = await post("someone@example.com");

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("900");
    expect(mail).not.toHaveBeenCalled();
  });

  it("records a send that the provider refused", async () => {
    // Silence here is how a broken sender goes unnoticed: the reply is `ok`
    // whatever happens, so the log is the only trace.
    findUser.mockResolvedValue(unverified as never);
    mail.mockResolvedValue({ sent: false });
    const { log } = await import("@/lib/logger");

    expect((await post("someone@example.com")).status).toBe(200);
    expect(vi.mocked(log.error)).toHaveBeenCalled();
  });
});
