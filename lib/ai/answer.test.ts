import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findUnique: vi.fn(), update: vi.fn() },
    message: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  },
}));
vi.mock("./client", () => ({ askAi: vi.fn(), aiConfigured: vi.fn(() => true) }));
vi.mock("@/lib/channels/send", () => ({ deliverOutbound: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/billing/limits", () => ({
  checkLimit: vi.fn(),
  countMessage: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { answerCustomer } from "./answer";
import { prisma } from "@/lib/db";
import { askAi, aiConfigured } from "./client";
import { deliverOutbound } from "@/lib/channels/send";
import { checkLimit, countMessage } from "@/lib/billing/limits";

const convFind = vi.mocked(prisma.conversation.findUnique);
const convUpdate = vi.mocked(prisma.conversation.update);
const msgCreate = vi.mocked(prisma.message.create);
const msgUpdate = vi.mocked(prisma.message.update);
const msgFirst = vi.mocked(prisma.message.findFirst);
const ask = vi.mocked(askAi);
const limit = vi.mocked(checkLimit);
const counted = vi.mocked(countMessage);
const configured = vi.mocked(aiConfigured);
const deliver = vi.mocked(deliverOutbound);

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

describe("answerCustomer()", () => {
  it("counts the reply against the plan", async () => {
    // The meter has to run on this path, not only in the agent API: every real
    // Facebook and Instagram message comes through here, so an uncounted reply
    // makes the priced tiers identical and the usage bar permanently zero.
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(counted).toHaveBeenCalledWith("b1");
  });

  it("withholds the reply once the plan's messages are spent", async () => {
    limit.mockResolvedValue({ allowed: false, used: 500, limit: 500, planName: "Basic" } as never);

    await answerCustomer("b1", "c1", "გამარჯობა");

    // Refused before the model is called: a generation that gets discarded
    // still costs the owner money.
    expect(ask).not.toHaveBeenCalled();
    expect(msgCreate).not.toHaveBeenCalled();
    expect(counted).not.toHaveBeenCalled();
  });

  it("does not count a reply the model failed to produce", async () => {
    ask.mockResolvedValue(null);

    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(counted).not.toHaveBeenCalled();
  });

  it("stores the reply before sending it", async () => {
    // Order matters. Delivered-but-unrecorded would show the customer an answer
    // the merchant's inbox has no memory of.
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(msgCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { conversationId: "c1", sender: "AI", text: "გამარჯობა, რით დაგეხმაროთ?" },
      }),
    );
    expect(deliver).toHaveBeenCalledWith("c1", "m9", "გამარჯობა, რით დაგეხმაროთ?");
    expect(msgCreate.mock.invocationCallOrder[0]).toBeLessThan(deliver.mock.invocationCallOrder[0]);
  });

  it("stays quiet when the tenant switched AI off for this chat", async () => {
    convFind.mockResolvedValue({ aiEnabled: false, botPausedUntil: null } as never);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(ask).not.toHaveBeenCalled();
  });

  it("stays quiet while a person has the conversation", async () => {
    // Answering across a handoff would have the bot talk over the operator.
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

  it("hands over to a person when the AI asks for one", async () => {
    ask.mockResolvedValue({
      reply: "ერთი წუთით, კოლეგას გადავცემ",
      handoffRequested: true,
      handoffReason: "refund request",
    });
    await answerCustomer("b1", "c1", "თანხა დამიბრუნეთ");

    // Both halves, because the inbox reads them from different rows: the pause
    // lights the mark, the reason explains it.
    expect(convUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { botPausedUntil: expect.any(Date) } }),
    );
    expect(msgUpdate).toHaveBeenCalledWith({
      where: { id: "m9" },
      data: { stoppedReason: "refund request" },
    });
  });

  it("marks the chat when the AI could not answer at all", async () => {
    // Otherwise it sits in the inbox looking answered, and nobody looks again.
    ask.mockResolvedValue(null);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(msgCreate).not.toHaveBeenCalled();
    expect(msgUpdate).toHaveBeenCalledWith({
      where: { id: "m8" },
      data: { stoppedReason: "ai_error" },
    });
  });

  it("does nothing at all when the service is not configured", async () => {
    configured.mockReturnValue(false);
    await answerCustomer("b1", "c1", "გამარჯობა");

    expect(convFind).not.toHaveBeenCalled();
    expect(ask).not.toHaveBeenCalled();
  });
});
