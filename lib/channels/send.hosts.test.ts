import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { conversation: { findUnique: vi.fn() }, message: { update: vi.fn() } } }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { sendToMessenger } from "./send";

function stubFetch(body: unknown) {
  const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("which host each channel is answered on", () => {
  it("sends an Instagram reply to graph.instagram.com, not graph.facebook.com", async () => {
    const fetchMock = stubFetch({ message_id: "mid.ig" });

    await sendToMessenger("IGID_1", "IGA-token", "IGSID_1", "გამარჯობა", "INSTAGRAM");

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("https://graph.instagram.com/");
    expect(url).toContain("/IGID_1/messages");
  });

  it("sends an Instagram reply on a Page token to graph.facebook.com, addressed as me", async () => {
    const fetchMock = stubFetch({ message_id: "mid.ig.page" });

    await sendToMessenger("IGID_1", "EAA-page-token", "IGSID_1", "გამარჯობა", "INSTAGRAM");

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("https://graph.facebook.com/");
    expect(url).toContain("/me/messages");
    expect(url).not.toContain("IGID_1");
  });

  it("still sends a Facebook reply to graph.facebook.com", async () => {
    const fetchMock = stubFetch({ message_id: "mid.fb" });

    await sendToMessenger("PAGE_1", "EAA-token", "PSID_1", "გამარჯობა", "FACEBOOK");

    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.facebook.com/");
  });

  it("defaults to Facebook when no channel is named", async () => {
    const fetchMock = stubFetch({});

    await sendToMessenger("PAGE_1", "tok", "PSID_1", "hi");

    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.facebook.com/");
  });
});
