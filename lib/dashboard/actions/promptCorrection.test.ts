import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { conversation: { findFirst: vi.fn() }, aiConfig: { findUnique: vi.fn(), upsert: vi.fn() } },
}));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/billing/access", () => ({ businessActivated: vi.fn(async () => true) }));
vi.mock("@/lib/ai/client", () => ({ aiConfigured: vi.fn(), editPromptDetailed: vi.fn() }));

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { aiConfigured, editPromptDetailed } from "@/lib/ai/client";
import { applyPromptCorrection, proposePromptCorrection } from "./promptCorrection";

const thread = [
  { id: "m1", sender: "CUSTOMER", text: "როდის მუშაობთ?" },
  { id: "m2", sender: "AI", text: "24/7" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  vi.mocked(aiConfigured).mockReturnValue(true);
  vi.mocked(prisma.conversation.findFirst).mockResolvedValue({ messages: thread } as never);
  vi.mocked(prisma.aiConfig.findUnique).mockResolvedValue({ prompt: "ძველი" } as never);
});

describe("proposePromptCorrection()", () => {
  it("asks the AI service to fix the prompt and returns old and new for the diff", async () => {
    vi.mocked(editPromptDetailed).mockResolvedValue({ ok: true, prompt: "ახალი" });

    expect(await proposePromptCorrection("c1", ["m2"], "დღის ნებისმიერ დროს")).toEqual({ ok: true, prompt: "ახალი", saved: "ძველი" });
    expect(prisma.conversation.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "c1", businessId: "b1" } }));
    const [businessId, instruction] = vi.mocked(editPromptDetailed).mock.calls[0];
    expect(businessId).toBe("b1");
    expect(instruction).toContain("ასისტენტი [არასწორი პასუხი]: 24/7");
  });

  it("passes on why the AI service failed", async () => {
    vi.mocked(editPromptDetailed).mockResolvedValue({ ok: false, failure: { kind: "refused", status: 422, waitedMs: 37_000, detail: "x" } });

    expect(await proposePromptCorrection("c1", ["m2"], "ტექსტი")).toEqual({ ok: false, error: "failed", reason: "refused", status: 422, seconds: 37 });
  });

  it("does not call the AI for another business's chat, an empty note, or without the right", async () => {
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null);
    expect(await proposePromptCorrection("other", ["m2"], "ტექსტი")).toEqual({ ok: false, error: "empty" });
    expect(await proposePromptCorrection("c1", ["m2"], "  ")).toEqual({ ok: false, error: "empty" });
    vi.mocked(requirePermission).mockResolvedValueOnce(null);
    expect(await proposePromptCorrection("c1", ["m2"], "ტექსტი")).toEqual({ ok: false, error: "forbidden" });
    expect(editPromptDetailed).not.toHaveBeenCalled();
  });
});

describe("applyPromptCorrection()", () => {
  it("saves the new prompt for this business only", async () => {
    expect(await applyPromptCorrection("  ახალი  ")).toEqual({ ok: true });
    expect(prisma.aiConfig.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { businessId: "b1" }, update: { prompt: "ახალი" } }));
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("refuses an empty prompt or a user without the right", async () => {
    expect(await applyPromptCorrection("   ")).toEqual({ ok: false });
    vi.mocked(requirePermission).mockResolvedValueOnce(null);
    expect(await applyPromptCorrection("ახალი")).toEqual({ ok: false });
    expect(prisma.aiConfig.upsert).not.toHaveBeenCalled();
  });
});
