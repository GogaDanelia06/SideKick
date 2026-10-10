import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConfig: { findUnique: vi.fn() },
    conversation: { findUnique: vi.fn(), update: vi.fn() },
    message: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  },
}));
vi.mock("./ensurePrompt", () => ({ ensurePrompt: vi.fn() }));
vi.mock("./client", () => ({ askAi: vi.fn(), aiConfigured: () => true }));
vi.mock("@/lib/channels/send", () => ({ deliverOutbound: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn(async () => ({ allowed: true })), countMessage: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { answerCustomer } from "./answer";
import { prisma } from "@/lib/db";
import { askAi } from "./client";
import { ensurePrompt } from "./ensurePrompt";
import { log } from "@/lib/logger";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.aiConfig.findUnique).mockResolvedValue({ emoji: null } as never);
  vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ aiEnabled: true, botPausedUntil: null } as never);
  vi.mocked(prisma.message.create).mockResolvedValue({ id: "m9" } as never);
  vi.mocked(askAi).mockResolvedValue({ reply: "გამარჯობა", handoffRequested: false, handoffReason: null });
});

describe("answerCustomer() for a business that has no prompt yet", () => {
  it("gives it one before asking the AI", async () => {
    const order: string[] = [];
    vi.mocked(ensurePrompt).mockImplementation(async () => (order.push("prompt"), true));
    vi.mocked(askAi).mockImplementation(async () => (order.push("ask"), { reply: "hi", handoffRequested: false, handoffReason: null }));

    await answerCustomer("b1", "c1", "გამარჯობა");
    expect(order).toEqual(["prompt", "ask"]);
    expect(ensurePrompt).toHaveBeenCalledWith("b1");
  });

  it("still asks, and logs why, when it could not be given one", async () => {
    vi.mocked(ensurePrompt).mockRejectedValue(new Error("db down"));

    await answerCustomer("b1", "c1", "გამარჯობა");
    expect(log.error).toHaveBeenCalledWith("could not give the business a prompt to start from", expect.any(Error), { businessId: "b1" });
    expect(askAi).toHaveBeenCalled();
  });
});
