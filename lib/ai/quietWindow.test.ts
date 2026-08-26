import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConfig: { findUnique: vi.fn() },
    message: { findMany: vi.fn() },
  },
}));
vi.mock("./answer", () => ({ answerCustomer: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { answerAfterQuietWindow } from "./quietWindow";
import { prisma } from "@/lib/db";
import { answerCustomer } from "./answer";

const config = vi.mocked(prisma.aiConfig.findUnique);
const messages = vi.mocked(prisma.message.findMany);
const answer = vi.mocked(answerCustomer);

/** Newest first, the order the query returns. */
const said = (...rows: { id: string; sender: string; text: string }[]) =>
  messages.mockResolvedValue(rows as never);

beforeEach(() => {
  vi.clearAllMocks();
  // Zero delay: the waiting is not what these tests are about.
  config.mockResolvedValue({ replyDelaySec: 0 } as never);
});

describe("answerAfterQuietWindow()", () => {
  it("answers the whole run of what the customer said, oldest first", async () => {
    // The point of the feature: three deliveries are one question.
    said(
      { id: "m3", sender: "CUSTOMER", text: "in blue" },
      { id: "m2", sender: "CUSTOMER", text: "do you have the 15 Pro" },
      { id: "m1", sender: "CUSTOMER", text: "hi" },
    );

    await answerAfterQuietWindow("b1", "c1", "m3");

    expect(answer).toHaveBeenCalledWith("b1", "c1", "hi\ndo you have the 15 Pro\nin blue");
  });

  it("steps aside when a newer message arrived while it waited", async () => {
    // Without this every delivery answers and the customer gets three replies.
    said(
      { id: "m3", sender: "CUSTOMER", text: "in blue" },
      { id: "m2", sender: "CUSTOMER", text: "hi" },
    );

    await answerAfterQuietWindow("b1", "c1", "m2");

    expect(answer).not.toHaveBeenCalled();
  });

  it("stops the run at the last thing that was not the customer", async () => {
    // Only the current turn. Everything before the previous answer is history.
    said(
      { id: "m4", sender: "CUSTOMER", text: "and the price?" },
      { id: "m3", sender: "AI", text: "yes, in stock" },
      { id: "m2", sender: "CUSTOMER", text: "do you have it" },
    );

    await answerAfterQuietWindow("b1", "c1", "m4");

    expect(answer).toHaveBeenCalledWith("b1", "c1", "and the price?");
  });

  it("does nothing when the newest message is not the customer's", async () => {
    said({ id: "m2", sender: "OPERATOR", text: "on my way" });

    await answerAfterQuietWindow("b1", "c1", "m1");

    expect(answer).not.toHaveBeenCalled();
  });

  it("caps a delay somebody typed too large", async () => {
    // The value decides how long a serverless function is held open.
    config.mockResolvedValue({ replyDelaySec: 99_999 } as never);
    said({ id: "m1", sender: "CUSTOMER", text: "hi" });

    vi.useFakeTimers();
    const run = answerAfterQuietWindow("b1", "c1", "m1");
    await vi.advanceTimersByTimeAsync(120_000);
    await run;
    vi.useRealTimers();

    expect(answer).toHaveBeenCalled();
  });
});
