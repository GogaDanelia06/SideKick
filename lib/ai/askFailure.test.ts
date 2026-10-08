import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { askAiDetailed } from "./client";
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

/** Why there was no reply, told apart: each of these needs a different fix. */
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
