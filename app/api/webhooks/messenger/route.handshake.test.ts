import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/channels/inbound", () => ({ recordInbound: vi.fn() }));
vi.mock("@/lib/channels/notify", () => ({ notifyAgent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/channels/profile", () => ({ nameCustomer: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/ai/quietWindow", () => ({ answerAfterQuietWindow: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { GET } from "./route";
import { VERIFY_TOKEN, get, setupMetaEnv } from "./webhookTestKit";

setupMetaEnv();

describe("GET — the setup handshake", () => {
  it("echoes the challenge verbatim as plain text", async () => {
    const res = await GET(
      get(`hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=1158201444`),
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("1158201444");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("refuses a wrong verify token", async () => {
    const res = await GET(get("hub.mode=subscribe&hub.verify_token=guessed&hub.challenge=123"));
    expect(res.status).toBe(403);
  });

  it("refuses a request that is not a subscribe handshake", async () => {
    const res = await GET(get(`hub.mode=unsubscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=1`));
    expect(res.status).toBe(400);
  });

  it("says 503 rather than accepting anything when unconfigured", async () => {
    delete process.env.META_VERIFY_TOKEN;
    const res = await GET(get("hub.mode=subscribe&hub.verify_token=x&hub.challenge=1"));
    expect(res.status).toBe(503);
  });
});
