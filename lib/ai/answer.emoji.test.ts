import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConfig: { findUnique: vi.fn() },
    conversation: { findUnique: vi.fn(), update: vi.fn() },
    message: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  },
}));
vi.mock("./client", () => ({ askAi: vi.fn(), aiConfigured: () => true }));
vi.mock("@/lib/channels/send", () => ({ deliverOutbound: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({
  checkLimit: vi.fn(async () => ({ allowed: true })),
  countMessage: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { answerCustomer } from "./answer";
import { prisma } from "@/lib/db";
import { askAi } from "./client";
import { deliverOutbound } from "@/lib/channels/send";
import { countMessage } from "@/lib/billing/limits";

const ask = vi.mocked(askAi);
const msgCreate = vi.mocked(prisma.message.create);
const msgUpdate = vi.mocked(prisma.message.update);

function modelSays(reply: string) {
  ask.mockResolvedValue({ reply, handoffRequested: false, handoffReason: null });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.aiConfig.findUnique).mockResolvedValue({ emoji: "არასოდეს" } as never);
  vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ aiEnabled: true, botPausedUntil: null } as never);
  vi.mocked(prisma.message.findFirst).mockResolvedValue({ id: "m8" } as never);
  msgCreate.mockResolvedValue({ id: "m9" } as never);
});

describe("answerCustomer() when the business turned emoji off", () => {
  it("stores and sends the reply without emoji", async () => {
    modelSays("😊 გამარჯობა! რით დაგეხმაროთ? 🙌");
    await answerCustomer("b1", "c1", "გამარჯობა");

    const text = "გამარჯობა! რით დაგეხმაროთ?";
    expect(msgCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { conversationId: "c1", sender: "AI", text } }),
    );
    expect(deliverOutbound).toHaveBeenCalledWith("c1", "m9", text);
  });

  it("sends nothing and flags the chat when the reply was only emoji", async () => {
    // No channel accepts an empty message, so the inbox shows the chat as unanswered instead.
    modelSays("👍");
    await answerCustomer("b1", "c1", "მადლობა");

    expect(msgCreate).not.toHaveBeenCalled();
    expect(deliverOutbound).not.toHaveBeenCalled();
    expect(countMessage).not.toHaveBeenCalled();
    expect(msgUpdate).toHaveBeenCalledWith({ where: { id: "m8" }, data: { stoppedReason: "ai_error" } });
  });
});
