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
import { body, delivery, post, sign, stored, setupMetaEnv } from "./webhookTestKit";

const record = vi.mocked(recordInbound);
const notify = vi.mocked(notifyAgent);

setupMetaEnv();

beforeEach(() => {
  vi.clearAllMocks();
  record.mockResolvedValue(stored());
});

const instagram = (text: string) =>
  delivery("instagram", "IGID_1", [{ from: "IGSID_1", mid: "mid_ig", text }]);

describe("POST — where each message goes", () => {
  it("files an Instagram delivery under the Instagram channel", async () => {
    const raw = instagram("გამარჯობა");
    const res = await POST(post(raw, sign(raw)));

    expect(res.status).toBe(200);
    expect(record).toHaveBeenCalledWith("INSTAGRAM", {
      pageId: "IGID_1",
      senderId: "IGSID_1",
      text: "გამარჯობა",
      externalId: "mid_ig",
      platform: "instagram",
    });
  });

  it("tells the AI service which channel to answer on", async () => {
    record.mockResolvedValue(stored({ channel: "INSTAGRAM", conversationId: "conv9", messageId: "m9" }));
    const raw = instagram("ჰეი");
    await POST(post(raw, sign(raw)));

    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ channel: "INSTAGRAM" }));
  });

  it("answers 200 for a page no tenant has connected", async () => {
    record.mockResolvedValue(null);
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(notify).not.toHaveBeenCalled();
  });

  it("ignores an echo of our own reply", async () => {
    const raw = delivery("page", "PAGE_1", [
      { from: "PAGE_1", mid: "mid_x", text: "ჩვენი პასუხი", echo: true },
    ]);

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(record).not.toHaveBeenCalled();
  });

  it("asks Meta to re-send when a message of ours could not be stored", async () => {
    record.mockRejectedValue(new Error("database is down"));
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(500);
  });

  it("keeps the rest of a batch when one message fails", async () => {
    const raw = delivery("page", "PAGE_1", [
      { from: "PSID_1", mid: "mid_1", text: "ერთი" },
      { from: "PSID_2", mid: "mid_2", text: "ორი" },
    ]);
    record.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(stored({ conversationId: "conv2", messageId: "m2" }));

    const res = await POST(post(raw, sign(raw)));

    expect(res.status).toBe(500);
    expect(record).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledTimes(1);
  });
});
