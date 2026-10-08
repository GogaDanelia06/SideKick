import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConfig: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
    business: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));
vi.mock("./client", () => ({ buildPrompt: vi.fn() }));

import { ensurePrompt, starterPrompt } from "./ensurePrompt";
import { prisma } from "@/lib/db";
import { buildPrompt } from "./client";

const find = vi.mocked(prisma.aiConfig.findUnique);
const update = vi.mocked(prisma.aiConfig.updateMany);
const create = vi.mocked(prisma.aiConfig.create);
const draft = vi.mocked(buildPrompt);

beforeEach(() => {
  vi.clearAllMocks();
  update.mockResolvedValue({ count: 1 });
  create.mockResolvedValue({} as never);
  vi.mocked(prisma.business.findUnique).mockResolvedValue({ name: "Cool Cat", field: "pets" } as never);
});

/**
 * The bug this closes: the AI service answers 404 "No prompt found" for a business with no
 * saved prompt, and every new business starts with none — so its first test, and every
 * customer who wrote to it, got no reply.
 */
describe("ensurePrompt()", () => {
  it("leaves a business that has a prompt alone, without calling the AI", async () => {
    find.mockResolvedValue({ prompt: "Be kind." } as never);

    expect(await ensurePrompt("b1")).toBe(false);
    expect(draft).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("has the AI service draft one from the business profile when there is none", async () => {
    find.mockResolvedValue({ prompt: null } as never);
    draft.mockResolvedValue("You are Cool Cat's assistant…");

    expect(await ensurePrompt("b1")).toBe(true);
    expect(update).toHaveBeenCalledWith({ where: { businessId: "b1", prompt: null }, data: { prompt: "You are Cool Cat's assistant…" } });
  });

  it("treats a prompt of only spaces as none, and replaces exactly what it saw", async () => {
    find.mockResolvedValue({ prompt: "   " } as never);
    draft.mockResolvedValue("Drafted.");

    await ensurePrompt("b1");
    expect(update).toHaveBeenCalledWith({ where: { businessId: "b1", prompt: "   " }, data: { prompt: "Drafted." } });
  });

  it("falls back to a starter text naming the business when the AI service cannot draft", async () => {
    find.mockResolvedValue({ prompt: "" } as never);
    draft.mockResolvedValue(null);

    expect(await ensurePrompt("b1")).toBe(true);
    const saved = update.mock.calls[0][0].data.prompt as string;
    expect(saved).toContain("„Cool Cat“");
    expect(saved).toContain("(pets)");
  });

  it("never overwrites a prompt the owner saved while it was drafting", async () => {
    find.mockResolvedValue({ prompt: null } as never);
    draft.mockResolvedValue("Drafted.");
    update.mockResolvedValue({ count: 0 });

    expect(await ensurePrompt("b1")).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the config when the business has none at all", async () => {
    find.mockResolvedValue(null);
    draft.mockResolvedValue("Drafted.");
    update.mockResolvedValue({ count: 0 });

    expect(await ensurePrompt("b1")).toBe(true);
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ businessId: "b1", prompt: "Drafted." }) });
  });

  it("says nothing was given when there is nothing to give", async () => {
    find.mockResolvedValue({ prompt: null } as never);
    draft.mockResolvedValue(null);
    vi.mocked(prisma.business.findUnique).mockResolvedValue(null);

    expect(await ensurePrompt("gone")).toBe(false);
  });
});

describe("starterPrompt()", () => {
  it("names the business, and its field only when there is one", () => {
    expect(starterPrompt("Cool Cat")).toContain("„Cool Cat“-ის ვირტუალური");
    expect(starterPrompt("Cool Cat", " ")).not.toContain("(");
  });
});
