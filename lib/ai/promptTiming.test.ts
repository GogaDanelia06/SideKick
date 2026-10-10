import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { buildPrompt, editPrompt } from "./client";
import { log } from "@/lib/logger";

const answers = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, json: async () => body });

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

/** Writing a prompt is the slow part of the page: the log keeps how slow, call by call. */
describe("prompt calls: timing", () => {
  it("logs how long a prompt took to build, and which call it was", async () => {
    vi.stubGlobal("fetch", answers({ system_prompt: " ready " }));

    expect(await buildPrompt("biz_1")).toBe("ready");
    expect(log.info).toHaveBeenCalledWith(
      "AI service wrote a prompt",
      expect.objectContaining({ businessId: "biz_1", call: "build-prompt", waitedMs: expect.any(Number) }),
    );
  });

  it("logs how long an edit took, and sends the instruction the way the service wants it", async () => {
    const fetchMock = answers({ system_prompt: "shorter" });
    vi.stubGlobal("fetch", fetchMock);

    expect(await editPrompt("biz_1", "make it shorter")).toBe("shorter");
    expect(fetchMock.mock.calls[0][0]).toBe("https://ai.example.com/businesses/biz_1/edit-prompt");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ edit_instructions: "make it shorter" });
    expect(log.info).toHaveBeenCalledWith("AI service wrote a prompt", expect.objectContaining({ call: "edit-prompt" }));
  });

  it("does not say it wrote a prompt when it did not", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502, text: async () => "bad gateway" }));

    expect(await editPrompt("biz_1", "shorter")).toBeNull();
    expect(log.info).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith("AI service could not edit the prompt", undefined, expect.objectContaining({ kind: "server_error", status: 502 }));
  });
});
