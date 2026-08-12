import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { askAi, buildPrompt, releaseToBot, aiConfigured } from "./client";

const ok = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, json: async () => body });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AI_SERVICE_URL = "https://ai.example.com";
  process.env.AI_SERVICE_KEY = "service-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.AI_SERVICE_URL;
  delete process.env.AI_SERVICE_KEY;
});

describe("askAi()", () => {
  it("puts the business in the path and the message in the body", async () => {
    const fetchMock = ok({ reply: "გამარჯობა" });
    vi.stubGlobal("fetch", fetchMock);
    await askAi("biz_1", "conv_1", "ფასი?");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai.example.com/businesses/biz_1/messages");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer service-key",
    });
    // Their field names, not ours — the translation lives in this one file.
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      conversation_id: "conv_1",
      message: "ფასი?",
    });
  });

  it("carries the handoff flags across the naming difference", async () => {
    vi.stubGlobal(
      "fetch",
      ok({ reply: "გადავცემ კოლეგას", handoff_requested: true, handoff_reason: "refund" }),
    );

    expect(await askAi("b", "c", "hi")).toEqual({
      reply: "გადავცემ კოლეგას",
      handoffRequested: true,
      handoffReason: "refund",
    });
  });

  it("treats a blank reply as no reply", async () => {
    // Stored, it would show the customer an empty bubble from the business.
    vi.stubGlobal("fetch", ok({ reply: "   " }));
    expect(await askAi("b", "c", "hi")).toBeNull();
  });

  it("returns null when the service refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "unauthorized" }),
    );
    expect(await askAi("b", "c", "hi")).toBeNull();
  });

  it("returns null rather than throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(askAi("b", "c", "hi")).resolves.toBeNull();
  });

  it("does nothing without a URL and key", async () => {
    delete process.env.AI_SERVICE_URL;
    const fetchMock = ok({ reply: "x" });
    vi.stubGlobal("fetch", fetchMock);

    expect(aiConfigured()).toBe(false);
    expect(await askAi("b", "c", "hi")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("escapes ids so a stray slash cannot reshape the path", async () => {
    const fetchMock = ok({ reply: "x" });
    vi.stubGlobal("fetch", fetchMock);
    await askAi("biz/../admin", "c", "hi");

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://ai.example.com/businesses/biz%2F..%2Fadmin/messages",
    );
  });
});

describe("buildPrompt() / releaseToBot()", () => {
  it("reads the generated prompt out of their field name", async () => {
    vi.stubGlobal("fetch", ok({ business_id: "b", system_prompt: "You are…" }));
    expect(await buildPrompt("b")).toBe("You are…");
  });

  it("reports whether the conversation was taken back", async () => {
    vi.stubGlobal("fetch", ok({ conversation_id: "c", mode: "auto" }));
    expect(await releaseToBot("b", "c")).toBe(true);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "" }));
    expect(await releaseToBot("b", "c")).toBe(false);
  });

  it("trims a trailing slash on the base URL instead of doubling it", async () => {
    process.env.AI_SERVICE_URL = "https://ai.example.com/";
    const fetchMock = ok({ system_prompt: "x" });
    vi.stubGlobal("fetch", fetchMock);
    await buildPrompt("b");

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://ai.example.com/businesses/b/build-prompt",
    );
  });
});
