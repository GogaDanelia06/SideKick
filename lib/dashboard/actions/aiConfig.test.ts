import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { aiConfig: { upsert: vi.fn() } } }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));

import { saveAiPrompt, setAiLanguages } from "./aiConfig";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

const permit = vi.mocked(requirePermission);
const upsert = vi.mocked(prisma.aiConfig.upsert);

const CTX = { userId: "u1", businessId: "b1", role: "OWNER" };

beforeEach(() => {
  vi.clearAllMocks();
  permit.mockResolvedValue(CTX as never);
  upsert.mockResolvedValue({} as never);
});

describe("setAiLanguages()", () => {
  it("saves the trimmed, de-duplicated list and reports success", async () => {
    expect(await setAiLanguages([" English ", "ქართული", "English", ""])).toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId: "b1" },
        update: { languages: ["English", "ქართული"] },
      }),
    );
  });

  it("reports a refusal instead of pretending to save", async () => {
    permit.mockResolvedValue(null);
    expect(await setAiLanguages(["English"])).toEqual({ ok: false, error: "forbidden" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("keeps at least one language", async () => {
    expect(await setAiLanguages(["  "])).toEqual({ ok: false, error: "empty" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("refuses more than the maximum", async () => {
    const many = Array.from({ length: 13 }, (_, i) => `Language ${i}`);
    expect(await setAiLanguages(many)).toEqual({ ok: false, error: "too_many" });
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe("saveAiPrompt()", () => {
  it("reports a refusal instead of pretending to save", async () => {
    permit.mockResolvedValue(null);
    const fd = new FormData();
    fd.set("prompt", "Be brief.");
    expect(await saveAiPrompt(fd)).toEqual({ ok: false, error: "forbidden" });
    expect(upsert).not.toHaveBeenCalled();
  });
});
