import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/passwordReset", () => ({ createResetToken: vi.fn() }));
vi.mock("@/lib/mail/send", () => ({ sendMail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/mail/templates", () => ({ passwordResetEmail: vi.fn(() => ({})) }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/security/rateLimit", () => ({
  clientIp: () => "1.2.3.4",
  consume: vi.fn().mockResolvedValue({ ok: true, remaining: 2, retryAfterSec: 0 }),
  tooManyRequestsMessage: () => "too many",
}));

import { POST } from "./route";
import { createResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { consume } from "@/lib/security/rateLimit";

const issue = vi.mocked(createResetToken);
const mail = vi.mocked(sendMail);
const limit = vi.mocked(consume);

const post = (email: string) =>
  POST(
    new Request("https://sidekick.ge/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  limit.mockResolvedValue({ ok: true, remaining: 2, retryAfterSec: 0 });
  mail.mockResolvedValue({ sent: true });
});

describe("POST /api/auth/forgot", () => {
  it("sends a link to a registered address", async () => {
    issue.mockResolvedValue({
      token: "t",
      user: { id: "u1", email: "a@b.ge", name: "A" },
      expiresAt: new Date(),
    } as never);

    const res = await post("a@b.ge");
    expect(res.status).toBe(200);
    expect(mail).toHaveBeenCalledOnce();
  });

  it("tells an unregistered address so, with a code the form can act on", async () => {
    issue.mockResolvedValue(null);

    const res = await post("nobody@b.ge");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ code: "not_registered" });
    expect(mail).not.toHaveBeenCalled();
  });

  it("still answers ok when the provider refuses — that is ours to find in the logs", async () => {
    issue.mockResolvedValue({
      token: "t",
      user: { id: "u1", email: "a@b.ge", name: "A" },
      expiresAt: new Date(),
    } as never);
    mail.mockResolvedValue({ sent: false });

    expect((await post("a@b.ge")).status).toBe(200);
  });

  it("rate-limits before looking the address up, so probing stays bounded", async () => {
    // With "not registered" said plainly, the limiter is the only thing between
    // this endpoint and a list of who has an account. It must run first.
    limit.mockResolvedValueOnce({ ok: false, remaining: 0, retryAfterSec: 600 });

    const res = await post("nobody@b.ge");
    expect(res.status).toBe(429);
    expect(issue).not.toHaveBeenCalled();
  });
});
