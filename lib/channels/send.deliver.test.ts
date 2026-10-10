import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findUnique: vi.fn() },
    message: { update: vi.fn().mockResolvedValue({}) },
  },
}));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { deliverOutbound } from "./send";
import { prisma } from "@/lib/db";
import { ok, ready } from "./sendTestKit";

const convFind = vi.mocked(prisma.conversation.findUnique);
const msgUpdate = vi.mocked(prisma.message.update);

const fetchMock = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue(ok({ recipient_id: "PSID_1", message_id: "mid_out_1" }));
  convFind.mockResolvedValue(ready as never);
  msgUpdate.mockResolvedValue({} as never);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("deliverOutbound()", () => {
  it("sends and records the outcome on the message", async () => {
    const result = await deliverOutbound("conv1", "m1", "დიახ, გვაქვს");

    expect(result?.status).toBe("SENT");
    expect(msgUpdate).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { deliveryStatus: "SENT", externalId: "mid_out_1" },
    });
  });

  it("stores Meta's outbound id so its echo is not read as a new question", async () => {
    await deliverOutbound("conv1", "m1", "hi");
    expect(msgUpdate.mock.calls[0][0].data).toHaveProperty("externalId", "mid_out_1");
  });

  it.each([
    ["a conversation with no customer", { ...ready, customerRef: null }],
    ["a conversation with no channel", { ...ready, channel: null }],
    ["a channel switched off", { ...ready, channel: { ...ready.channel, connected: false } }],
    ["a page that was never linked", { ...ready, channel: { ...ready.channel, externalId: null } }],
    ["a page with no token yet", { ...ready, channel: { ...ready.channel, accessToken: null } }],
    ["a channel that is not Facebook", { ...ready, channel: { ...ready.channel, type: "WEBSITE" } }],
  ])("stays quiet for %s", async (_label, conversation) => {
    convFind.mockResolvedValue(conversation as never);

    expect(await deliverOutbound("conv1", "m1", "hi")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(msgUpdate).not.toHaveBeenCalled();
  });

  it("records a failure without throwing", async () => {
    fetchMock.mockRejectedValue(new Error("Meta is down"));

    const result = await deliverOutbound("conv1", "m1", "hi");

    expect(result?.status).toBe("FAILED");
    expect(msgUpdate).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { deliveryStatus: "FAILED" },
    });
  });
});
