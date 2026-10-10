import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findUnique: vi.fn() },
    message: { update: vi.fn().mockResolvedValue({}) },
  },
}));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { sendToMessenger } from "./send";
import { ok, refused } from "./sendTestKit";

const fetchMock = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue(ok({ recipient_id: "PSID_1", message_id: "mid_out_1" }));
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
      messaging_type: "RESPONSE",
      message: { text: "დიახ, გვაქვს" },
    });
  });

  it("reports the id Meta gives back", async () => {
    const result = await sendToMessenger("PAGE_1", "t", "PSID_1", "hi");
    expect(result).toEqual({ status: "SENT", externalId: "mid_out_1" });
  });

  it("separates a closed 24h window from a real failure", async () => {
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
