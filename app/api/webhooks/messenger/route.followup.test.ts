import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/channels/inbound", () => ({ recordInbound: vi.fn() }));
vi.mock("@/lib/channels/notify", () => ({ notifyAgent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/channels/profile", () => ({ nameCustomer: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/ai/quietWindow", () => ({ answerAfterQuietWindow: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { POST } from "./route";
import { recordInbound } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";
import { nameCustomer } from "@/lib/channels/profile";
import { answerAfterQuietWindow } from "@/lib/ai/quietWindow";
import { body, delivery, post, sign, stored, setupMetaEnv } from "./webhookTestKit";

const record = vi.mocked(recordInbound);
const notify = vi.mocked(notifyAgent);
const name = vi.mocked(nameCustomer);
const answer = vi.mocked(answerAfterQuietWindow);

setupMetaEnv();

beforeEach(() => {
  vi.clearAllMocks();
  record.mockResolvedValue(stored());
});

describe("POST — what happens after a message is stored", () => {
  it("looks up the customer's name once per chat, not once per message", async () => {
    record.mockResolvedValue(stored({ needsName: true }));
    const raw = delivery("page", "PAGE_1", [
      { from: "PSID_1", mid: "mid_1", text: "ერთი" },
      { from: "PSID_1", mid: "mid_2", text: "ორი" },
    ]);
    await POST(post(raw, sign(raw)));

    expect(name).toHaveBeenCalledTimes(1);
    expect(name).toHaveBeenCalledWith("conv1");
  });

  it("does not re-ask Meta for a name the chat already has", async () => {
    const raw = body();
    await POST(post(raw, sign(raw)));

    expect(name).not.toHaveBeenCalled();
  });

  it("hands the message off to the quiet window rather than answering at once", async () => {
    record.mockResolvedValue(stored({ text: "ფასი რა ღირს?" }));
    const raw = body("ფასი რა ღირს?");
    await POST(post(raw, sign(raw)));

    expect(answer).toHaveBeenCalledWith("b1", "conv1", "m1");
  });

  it("does not answer a message it already had", async () => {
    record.mockResolvedValue(stored({ isNew: false }));
    const raw = body();
    await POST(post(raw, sign(raw)));

    expect(answer).not.toHaveBeenCalled();
  });

  it("tells the AI service about a new message", async () => {
    const raw = body();
    await POST(post(raw, sign(raw)));

    expect(notify).toHaveBeenCalledWith({
      event: "message.received",
      businessId: "b1",
      conversationId: "conv1",
      messageId: "m1",
      channel: "FACEBOOK",
    });
  });

  it("does not tell the AI service twice about a re-sent message", async () => {
    record.mockResolvedValue(stored({ isNew: false }));
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(notify).not.toHaveBeenCalled();
  });
});
