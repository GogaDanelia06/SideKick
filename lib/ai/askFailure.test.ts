import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { askAi, askAiDetailed, editPrompt } from "./client";
import { log } from "@/lib/logger";

const failureOf = async () => {
  const answer = await askAiDetailed("biz_1", "conv_1", "hi");
  if (answer.ok) throw new Error("expected a failure");
  return answer.failure;
};

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

describe("askAiDetailed() failures", () => {
  it("calls a 5xx an error in the service, with its status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502, text: async () => "bad gateway" }));
    expect(await failureOf()).toMatchObject({ kind: "server_error", status: 502 });
  });

  it("calls a 4xx a refusal of the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, text: async () => "too long" }));
    expect(await failureOf()).toMatchObject({ kind: "refused", status: 422 });
  });

  it("calls an aborted request a timeout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("This operation was aborted"), { name: "AbortError" })));
    expect(await failureOf()).toMatchObject({ kind: "timeout" });
  });

  it("calls any other thrown error an unreachable service", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect(await failureOf()).toMatchObject({ kind: "unreachable" });
  });

  it("tells an answer it cannot read from one that never came", async () => {
    const json = async () => {
      throw new SyntaxError("Unexpected token <");
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json }));
    expect(await failureOf()).toMatchObject({ kind: "bad_reply" });
  });

  it("tells a blank reply from a missing one", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reply: "  " }) }));
    expect(await failureOf()).toMatchObject({ kind: "empty_reply" });
  });

  it("knows when this environment has no AI service at all", async () => {
    delete process.env.AI_SERVICE_URL;
    expect(await failureOf()).toMatchObject({ kind: "unconfigured", waitedMs: 0 });
  });

  it("records how long it waited, and writes the cause to the log for whoever reads it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "model overloaded" }));
    const failure = await failureOf();

    expect(failure.waitedMs).toBeGreaterThanOrEqual(0);
    expect(log.error).toHaveBeenCalledWith(
      "AI service could not answer",
      undefined,
      expect.objectContaining({ conversationId: "conv_1", kind: "server_error", status: 500, detail: "HTTP 500: model overloaded" }),
    );
  });
});

describe("prompt calls", () => {
  afterEach(() => vi.useRealTimers());

  it("wait longer than a chat reply, because writing a whole prompt takes the service 25 to 45 seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(Object.assign(new Error("This operation was aborted"), { name: "AbortError" })));
            setTimeout(() => resolve({ ok: true, json: async () => ({ system_prompt: " ready ", reply: "ready" }) }), 60_000);
          }),
      ),
    );

    const prompt = editPrompt("biz_1", "shorter");
    const chat = askAi("biz_1", "conv_1", "hi");
    await vi.advanceTimersByTimeAsync(61_000);

    expect(await prompt).toBe("ready");
    expect(await chat).toBeNull();
  });

  it("log why one failed, so a timeout reads as a timeout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("This operation was aborted"), { name: "AbortError" })));

    expect(await editPrompt("biz_1", "shorter")).toBeNull();
    expect(log.error).toHaveBeenCalledWith(
      "AI service could not edit the prompt",
      undefined,
      expect.objectContaining({ businessId: "biz_1", kind: "timeout", detail: "This operation was aborted" }),
    );
  });
});
