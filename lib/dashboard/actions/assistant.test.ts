import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { aiConfig: { findUnique: vi.fn(), upsert: vi.fn() } } }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/ai/client", () => ({
  aiConfigured: () => true,
  askAi: vi.fn(),
  buildPrompt: vi.fn(),
  editPrompt: vi.fn(),
}));

import { testAiReply } from "./assistant";
import { prisma } from "@/lib/db";
import { askAi } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";

const ask = vi.mocked(askAi);

function modelSays(reply: string) {
  ask.mockResolvedValue({ reply, handoffRequested: false, handoffReason: null });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  vi.mocked(prisma.aiConfig.findUnique).mockResolvedValue({ emoji: "არასოდეს" } as never);
});

describe("testAiReply() when the business turned emoji off", () => {
  it("shows the reply without emoji", async () => {
    modelSays("Hi! 😄\n\nTake your time! I'm here to help. 🙌");

    expect(await testAiReply(" hello ")).toEqual({
      ok: true,
      reply: "Hi!\n\nTake your time! I'm here to help.",
      handoff: false,
    });
    expect(ask).toHaveBeenCalledWith("b1", "tester-b1", "hello");
  });

  it("reports a failure when the reply was only emoji", async () => {
    modelSays("👍");

    expect(await testAiReply("მადლობა")).toEqual({ ok: false, error: "failed" });
  });
});
