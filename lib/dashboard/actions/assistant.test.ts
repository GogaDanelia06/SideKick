import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { aiConfig: { findUnique: vi.fn(), upsert: vi.fn() } } }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/ensurePrompt", () => ({ ensurePrompt: vi.fn() }));
vi.mock("@/lib/ai/client", () => ({
  aiConfigured: () => true,
  askAiDetailed: vi.fn(),
  buildPrompt: vi.fn(),
  editPrompt: vi.fn(),
}));

import { testAiReply } from "./assistant";
import { prisma } from "@/lib/db";
import { askAiDetailed } from "@/lib/ai/client";
import { ensurePrompt } from "@/lib/ai/ensurePrompt";
import { log } from "@/lib/logger";
import { requirePermission } from "@/lib/auth/permissions";

const ask = vi.mocked(askAiDetailed);
const THREAD = "0a1b2c3d4e5f6a7b";

function modelSays(reply: string) {
  ask.mockResolvedValue({ ok: true, reply: { reply, handoffRequested: false, handoffReason: null } });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ensurePrompt).mockResolvedValue(false);
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  vi.mocked(prisma.aiConfig.findUnique).mockResolvedValue({ emoji: "არასოდეს" } as never);
});

describe("testAiReply()", () => {
  it("shows the reply without emoji", async () => {
    modelSays("Hi! 😄\n\nTake your time! I'm here to help. 🙌");

    expect(await testAiReply(" hello ", THREAD)).toEqual({
      ok: true,
      reply: "Hi!\n\nTake your time! I'm here to help.",
      handoff: false,
    });
    expect(ask).toHaveBeenCalledWith("b1", `tester-b1-${THREAD}`, "hello");
  });

  it("says so when the reply was only emoji and this business turned emoji off", async () => {
    modelSays("👍");

    expect(await testAiReply("მადლობა", THREAD)).toEqual({ ok: false, error: "failed", why: "emoji_only" });
  });

  it("refuses a malformed chat id without asking the AI", async () => {
    expect(await testAiReply("hi", "../other-thread")).toEqual({ ok: false, error: "failed", why: "unexpected" });
    expect(ask).not.toHaveBeenCalled();
  });

  /** The bug this closes: every one of these used to be shown as "the AI service did not answer". */
  it("tells the person what the AI service did, with its status and how long it took", async () => {
    ask.mockResolvedValue({ ok: false, failure: { kind: "server_error", status: 500, waitedMs: 12_300, detail: "boom" } });

    expect(await testAiReply("hi", THREAD)).toEqual({
      ok: false,
      error: "failed",
      why: "server_error",
      status: 500,
      waitedMs: 12_300,
    });
  });

  it("never passes on what the service said, only its status", async () => {
    ask.mockResolvedValue({ ok: false, failure: { kind: "refused", status: 422, waitedMs: 80, detail: "secret internals" } });

    expect(JSON.stringify(await testAiReply("hi", THREAD))).not.toContain("secret internals");
  });

  it("separates a failure on our side, and logs it", async () => {
    modelSays("hello");
    vi.mocked(prisma.aiConfig.findUnique).mockRejectedValue(new Error("db down"));

    expect(await testAiReply("hi", THREAD)).toEqual({ ok: false, error: "failed", why: "unexpected" });
    expect(log.error).toHaveBeenCalledWith("the AI tester failed on our side", expect.any(Error), { businessId: "b1" });
  });

  it("reports a missing permission as that, not as an AI failure", async () => {
    vi.mocked(requirePermission).mockResolvedValue(null as never);

    expect(await testAiReply("hi", THREAD)).toEqual({ ok: false, error: "forbidden" });
    expect(ask).not.toHaveBeenCalled();
  });

  it("gives a business without a prompt one before asking, and says so", async () => {
    vi.mocked(ensurePrompt).mockResolvedValue(true);
    modelSays("hello");
    const order: string[] = [];
    vi.mocked(ensurePrompt).mockImplementation(async () => (order.push("prompt"), true));
    ask.mockImplementation(async () => (order.push("ask"), { ok: true, reply: { reply: "hello", handoffRequested: false, handoffReason: null } }));

    expect(await testAiReply("hi", THREAD)).toMatchObject({ ok: true, promptDrafted: true });
    expect(order).toEqual(["prompt", "ask"]);
  });

  it("does not claim a draft when the business already had a prompt", async () => {
    modelSays("hello");
    expect(await testAiReply("hi", THREAD)).not.toHaveProperty("promptDrafted");
  });

  it("reports a failure to give a prompt as a failure on our side", async () => {
    vi.mocked(ensurePrompt).mockRejectedValue(new Error("db down"));
    expect(await testAiReply("hi", THREAD)).toEqual({ ok: false, error: "failed", why: "unexpected" });
    expect(ask).not.toHaveBeenCalled();
  });
});
