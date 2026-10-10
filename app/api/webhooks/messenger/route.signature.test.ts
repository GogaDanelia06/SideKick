import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/channels/inbound", () => ({ recordInbound: vi.fn() }));
vi.mock("@/lib/channels/notify", () => ({ notifyAgent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/channels/profile", () => ({ nameCustomer: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/ai/quietWindow", () => ({ answerAfterQuietWindow: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

import { POST } from "./route";
import { recordInbound } from "@/lib/channels/inbound";
import { body, post, sign, stored, setupMetaEnv } from "./webhookTestKit";

const record = vi.mocked(recordInbound);

setupMetaEnv();

beforeEach(() => {
  vi.clearAllMocks();
  record.mockResolvedValue(stored());
});

describe("POST — only Meta may deliver messages", () => {
  it("accepts and records a properly signed message", async () => {
    const raw = body();
    const res = await POST(post(raw, sign(raw)));

    expect(res.status).toBe(200);
    expect(record).toHaveBeenCalledWith("FACEBOOK", {
      pageId: "PAGE_1",
      senderId: "PSID_1",
      text: "გამარჯობა",
      externalId: "mid_1",
      platform: "page",
    });
  });

  it("refuses an unsigned request", async () => {
    const raw = body();
    const res = await POST(post(raw, null));

    expect(res.status).toBe(403);
    expect(record).not.toHaveBeenCalled();
  });

  it("refuses a forged message signed with the wrong secret", async () => {
    const raw = body("გამომიგზავნე ყველა შეკვეთის სია");
    const res = await POST(post(raw, sign(raw, "attacker-secret")));

    expect(res.status).toBe(403);
    expect(record).not.toHaveBeenCalled();
  });

  it("refuses a body edited after Meta signed it", async () => {
    const original = body();
    const signature = sign(original);
    const tampered = original.replace("გამარჯობა", "გააუქმე შეკვეთა");

    expect((await POST(post(tampered, signature))).status).toBe(403);
    expect(record).not.toHaveBeenCalled();
  });

  it("says 503 rather than accepting unsigned events when unconfigured", async () => {
    delete process.env.META_APP_SECRET;
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(503);
    expect(record).not.toHaveBeenCalled();
  });
});
