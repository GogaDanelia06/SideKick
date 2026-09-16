import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { aiConfig: { findUnique: vi.fn() } } }));

import { applyReplyStyle } from "./replyStyle";
import { prisma } from "@/lib/db";

const findConfig = vi.mocked(prisma.aiConfig.findUnique);

const REPLY = "გამარჯობა! 😄 რით დაგეხმაროთ?";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("applyReplyStyle()", () => {
  it("removes emoji when the business chose none", async () => {
    findConfig.mockResolvedValue({ emoji: "არასოდეს" } as never);

    expect(await applyReplyStyle("b1", REPLY)).toBe("გამარჯობა! რით დაგეხმაროთ?");
    expect(findConfig).toHaveBeenCalledWith(expect.objectContaining({ where: { businessId: "b1" } }));
  });

  it.each(["ზომიერად", "ხშირად"])("keeps emoji when the business chose %s", async (emoji) => {
    findConfig.mockResolvedValue({ emoji } as never);

    expect(await applyReplyStyle("b1", REPLY)).toBe(REPLY);
  });

  it("keeps the reply as written when nothing is saved", async () => {
    findConfig.mockResolvedValue(null as never);

    expect(await applyReplyStyle("b1", REPLY)).toBe(REPLY);
  });
});
