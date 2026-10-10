import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConfig: { findUnique: vi.fn() },
    conversation: { findUnique: vi.fn(), update: vi.fn() },
    message: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  },
}));
vi.mock("./ensurePrompt", () => ({ ensurePrompt: vi.fn().mockResolvedValue(false) }));
vi.mock("./client", () => ({ askAi: vi.fn(), aiConfigured: vi.fn(() => true) }));
vi.mock("@/lib/channels/send", () => ({ deliverOutbound: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/billing/limits", () => ({
  checkLimit: vi.fn(),
  countMessage: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { answerCustomer } from "./answer";
import { prisma } from "@/lib/db";
import { askAi, aiConfigured } from "./client";
import { checkLimit, countMessage } from "@/lib/billing/limits";

const convFind = vi.mocked(prisma.conversation.findUnique);
const msgCreate = vi.mocked(prisma.message.create);
const msgFirst = vi.mocked(prisma.message.findFirst);
const ask = vi.mocked(askAi);
const limit = vi.mocked(checkLimit);
const counted = vi.mocked(countMessage);
const configured = vi.mocked(aiConfigured);

const OPEN = { aiEnabled: true, botPausedUntil: null } as never;

beforeEach(() => {
  vi.clearAllMocks();
  configured.mockReturnValue(true);
  convFind.mockResolvedValue(OPEN);
  msgCreate.mockResolvedValue({ id: "m9" } as never);
  msgFirst.mockResolvedValue({ id: "m8" } as never);
  ask.mockResolvedValue({ reply: "გამარჯობა, რით დაგეხმაროთ?", handoffRequested: false, handoffReason: null });
  limit.mockResolvedValue({ allowed: true } as never);
});

describe("answerCustomer() — whether the AI answers", () => {
  it("withholds the reply once the plan's messages are spent", async () => {
    limit.mockResolvedValue({ allowed: false, used: 500, limit: 500, planName: "Basic" } as never);

    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(ask).not.toHaveBeenCalled();
    expect(msgCreate).not.toHaveBeenCalled();
    expect(counted).not.toHaveBeenCalled();
  });

  it("does not count a reply the model failed to produce", async () => {
    ask.mockResolvedValue(null);

    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(counted).not.toHaveBeenCalled();
  });

  it("stays quiet when the tenant switched AI off for this chat", async () => {
    convFind.mockResolvedValue({ aiEnabled: false, botPausedUntil: null } as never);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(ask).not.toHaveBeenCalled();
  });

  it("stays quiet while a person has the conversation", async () => {
    const later = new Date(Date.now() + 60 * 60_000);
    convFind.mockResolvedValue({ aiEnabled: true, botPausedUntil: later } as never);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(ask).not.toHaveBeenCalled();
  });

  it("answers again once the pause has run out", async () => {
    const past = new Date(Date.now() - 60 * 60_000);
    convFind.mockResolvedValue({ aiEnabled: true, botPausedUntil: past } as never);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(ask).toHaveBeenCalledOnce();
  });

  it("does nothing at all when the service is not configured", async () => {
    configured.mockReturnValue(false);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(convFind).not.toHaveBeenCalled();
    expect(ask).not.toHaveBeenCalled();
  });
});
