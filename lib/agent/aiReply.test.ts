import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/ai/replyStyle", () => ({ applyReplyStyle: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));

import { acceptAiReply } from "./aiReply";
import type { AgentDenial } from "./auth";
import { applyReplyStyle } from "@/lib/ai/replyStyle";
import { checkLimit } from "@/lib/billing/limits";

const styled = vi.mocked(applyReplyStyle);
const limit = vi.mocked(checkLimit);

const SPENT = { allowed: false, reason: "limit", used: 500, limit: 500, planName: "Basic" };

async function refusal(result: string | AgentDenial) {
  if (typeof result === "string") throw new Error(`expected a refusal, got "${result}"`);
  return { status: result.response.status, body: await result.response.json() };
}

beforeEach(() => {
  vi.clearAllMocks();
  styled.mockResolvedValue("გამარჯობა!");
  limit.mockResolvedValue({ allowed: true } as never);
});

describe("acceptAiReply()", () => {
  it("returns the reply in the business's style", async () => {
    expect(await acceptAiReply("b1", "გამარჯობა! 😄")).toBe("გამარჯობა!");
    expect(styled).toHaveBeenCalledWith("b1", "გამარჯობა! 😄");
  });

  it("refuses a reply with nothing left after styling, without touching the plan", async () => {
    styled.mockResolvedValue("");

    expect((await refusal(await acceptAiReply("b1", "👍"))).status).toBe(400);
    expect(limit).not.toHaveBeenCalled();
  });

  it("refuses once the plan's messages are spent", async () => {
    limit.mockResolvedValue(SPENT as never);
    const { status, body } = await refusal(await acceptAiReply("b1", "გამარჯობა!"));

    expect(status).toBe(402);
    expect(body).toMatchObject({ error: "message_limit_reached", used: 500, limit: 500 });
  });

  it("says so when the subscription has lapsed", async () => {
    limit.mockResolvedValue({ ...SPENT, reason: "expired" } as never);
    const { body } = await refusal(await acceptAiReply("b1", "გამარჯობა!"));

    expect(body.error).toBe("subscription_expired");
  });
});
