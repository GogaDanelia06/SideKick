import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findUnique: vi.fn() },
    message: { update: vi.fn().mockResolvedValue({}) },
  },
}));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { deliverOutbound, sendToMessenger } from "./send";
import { prisma } from "@/lib/db";

const convFind = vi.mocked(prisma.conversation.findUnique);
const msgUpdate = vi.mocked(prisma.message.update);

const fetchMock = vi.fn();
const originalFetch = globalThis.fetch;

/** A page fully connected and able to answer. */
const ready = {
  customerRef: "PSID_1",
  channel: {
    type: "FACEBOOK",
    connected: true,
    externalId: "PAGE_1",
    accessToken: "page-token",
  },
};

const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const refused = (status: number, body: unknown) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

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

describe("sendToMessenger()", () => {
  it("posts the shape Meta documents", async () => {
    await sendToMessenger("PAGE_1", "page-token", "PSID_1", "დიახ, გვაქვს");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/PAGE_1/messages");
    expect(url).toContain("access_token=page-token");
    expect(JSON.parse(init.body)).toEqual({
      recipient: { id: "PSID_1" },
      // Without this Meta refuses the message even inside the 24h window.
      messaging_type: "RESPONSE",
      message: { text: "დიახ, გვაქვს" },
    });
  });

  it("reports the id Meta gives back", async () => {
    const result = await sendToMessenger("PAGE_1", "t", "PSID_1", "hi");
    expect(result).toEqual({ status: "SENT", externalId: "mid_out_1" });
  });

  it("separates a closed 24h window from a real failure", async () => {
    // Policy, not a bug. Reported apart so nobody goes hunting for one.
    fetchMock.mockResolvedValue(
      refused(400, { error: { message: "Messaging window closed", code: 1545041 } }),
    );

    const result = await sendToMessenger("PAGE_1", "t", "PSID_1", "hi");
    expect(result.status).toBe("WINDOW_CLOSED");
  });

  it("passes Meta's own wording through on other refusals", async () => {
    fetchMock.mockResolvedValue(
      refused(400, { error: { message: "Invalid OAuth access token", code: 190 } }),
    );

    const result = await sendToMessenger("PAGE_1", "bad", "PSID_1", "hi");
    expect(result.status).toBe("FAILED");
    expect(result.detail).toBe("Invalid OAuth access token");
  });

  it("turns a network fault into a result instead of throwing", async () => {
    fetchMock.mockRejectedValue(new Error("socket hang up"));

    await expect(sendToMessenger("PAGE_1", "t", "PSID_1", "hi")).resolves.toEqual({
      status: "FAILED",
      detail: "socket hang up",
    });
  });
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
    // None of these are failures — there is simply nowhere to send to, and
    // saying "FAILED" would have the AI service retry something that can never
    // succeed.
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

describe("which host each channel is answered on", () => {
  it("sends an Instagram reply to graph.instagram.com, not graph.facebook.com", async () => {
    // Instagram here runs on Instagram Login, a separate API from the Messenger
    // Platform. Posting to graph.facebook.com returns "object does not exist" —
    // verified against the live account. Getting this wrong means every
    // Instagram reply silently fails to reach the customer.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message_id: "mid.ig" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendToMessenger("IGID_1", "IGA-token", "IGSID_1", "გამარჯობა", "INSTAGRAM");

    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.instagram.com/");
  });

  it("still sends a Facebook reply to graph.facebook.com", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message_id: "mid.fb" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendToMessenger("PAGE_1", "EAA-token", "PSID_1", "გამარჯობა", "FACEBOOK");

    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.facebook.com/");
  });

  it("defaults to Facebook when no channel is named", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await sendToMessenger("PAGE_1", "tok", "PSID_1", "hi");

    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.facebook.com/");
  });
});
