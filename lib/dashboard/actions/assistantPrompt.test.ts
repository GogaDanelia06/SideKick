import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { aiConfig: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), create: vi.fn() } } }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/ensurePrompt", () => ({ ensurePrompt: vi.fn() }));
vi.mock("@/lib/ai/client", () => ({
  aiConfigured: vi.fn(),
  askAi: vi.fn(),
  buildPrompt: vi.fn(),
  editPrompt: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { generateAiPrompt, refineAiPrompt } from "./assistant";
import { prisma } from "@/lib/db";
import { aiConfigured, buildPrompt, editPrompt } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";

const OWNER = { userId: "u1", businessId: "b1", role: "OWNER" } as never;

function expectNothingStored() {
  expect(prisma.aiConfig.upsert).not.toHaveBeenCalled();
  expect(prisma.aiConfig.update).not.toHaveBeenCalled();
  expect(prisma.aiConfig.create).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(aiConfigured).mockReturnValue(true);
  vi.mocked(requirePermission).mockResolvedValue(OWNER);
});

describe("generateAiPrompt()", () => {
  it("hands the text back and stores nothing", async () => {
    vi.mocked(buildPrompt).mockResolvedValue("You are the assistant of Cool Cat.");

    expect(await generateAiPrompt()).toEqual({ ok: true, prompt: "You are the assistant of Cool Cat." });
    expect(buildPrompt).toHaveBeenCalledWith("b1");
    expectNothingStored();
  });

  it("says it failed when the AI service wrote nothing", async () => {
    vi.mocked(buildPrompt).mockResolvedValue(null);

    expect(await generateAiPrompt()).toEqual({ ok: false, error: "failed" });
    expectNothingStored();
  });

  it("does not ask the AI without permission, or without an AI service", async () => {
    vi.mocked(requirePermission).mockResolvedValue(null as never);
    expect(await generateAiPrompt()).toEqual({ ok: false, error: "forbidden" });

    vi.mocked(requirePermission).mockResolvedValue(OWNER);
    vi.mocked(aiConfigured).mockReturnValue(false);
    expect(await generateAiPrompt()).toEqual({ ok: false, error: "unconfigured" });
    expect(buildPrompt).not.toHaveBeenCalled();
  });
});

describe("refineAiPrompt()", () => {
  it("hands the rewrite back and stores nothing", async () => {
    vi.mocked(editPrompt).mockResolvedValue("Shorter.");

    expect(await refineAiPrompt("  make it shorter ")).toEqual({ ok: true, prompt: "Shorter." });
    expect(editPrompt).toHaveBeenCalledWith("b1", "make it shorter");
    expectNothingStored();
  });

  it("asks for nothing when there is no instruction", async () => {
    expect(await refineAiPrompt("   ")).toEqual({ ok: false, error: "empty" });
    expect(editPrompt).not.toHaveBeenCalled();
  });

  it("says it failed when the AI service wrote nothing", async () => {
    vi.mocked(editPrompt).mockResolvedValue(null);

    expect(await refineAiPrompt("shorter")).toEqual({ ok: false, error: "failed" });
    expectNothingStored();
  });
});
