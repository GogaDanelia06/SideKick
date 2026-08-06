import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";

// `after` normally defers to the platform after the response is flushed. Run it
// straight away here so the test can observe what would have been pushed.
vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/channels/inbound", () => ({ recordInbound: vi.fn() }));
vi.mock("@/lib/channels/notify", () => ({ notifyAgent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { GET, POST } from "./route";
import { recordInbound } from "@/lib/channels/inbound";
import { notifyAgent } from "@/lib/channels/notify";

const record = vi.mocked(recordInbound);
const notify = vi.mocked(notifyAgent);

const APP_SECRET = "meta-app-secret";
const VERIFY_TOKEN = "our-verify-token-1234";

const sign = (body: string, secret = APP_SECRET) =>
  `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;

const body = (text = "გამარჯობა", mid = "mid_1") =>
  JSON.stringify({
    object: "page",
    entry: [
      {
        id: "PAGE_1",
        messaging: [{ sender: { id: "PSID_1" }, message: { mid, text } }],
      },
    ],
  });

function post(raw: string, signature: string | null) {
  return new Request("https://sidekick.ge/api/webhooks/messenger", {
    method: "POST",
    body: raw,
    headers: signature ? { "x-hub-signature-256": signature } : {},
  });
}

const get = (params: string) =>
  new Request(`https://sidekick.ge/api/webhooks/messenger?${params}`);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.META_APP_SECRET = APP_SECRET;
  process.env.META_VERIFY_TOKEN = VERIFY_TOKEN;
  record.mockResolvedValue({
    businessId: "b1",
    conversationId: "conv1",
    messageId: "m1",
    isNew: true,
  });
});

afterEach(() => {
  delete process.env.META_APP_SECRET;
  delete process.env.META_VERIFY_TOKEN;
});

describe("GET — the setup handshake", () => {
  it("echoes the challenge verbatim as plain text", async () => {
    const res = await GET(
      get(`hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=1158201444`),
    );

    expect(res.status).toBe(200);
    // Meta compares this byte for byte — no JSON wrapper, no trailing newline.
    expect(await res.text()).toBe("1158201444");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("refuses a wrong verify token", async () => {
    const res = await GET(
      get("hub.mode=subscribe&hub.verify_token=guessed&hub.challenge=123"),
    );
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

describe("POST — receiving messages", () => {
  it("accepts and records a properly signed message", async () => {
    const raw = body();
    const res = await POST(post(raw, sign(raw)));

    expect(res.status).toBe(200);
    expect(record).toHaveBeenCalledWith("FACEBOOK", {
      pageId: "PAGE_1",
      senderId: "PSID_1",
      text: "გამარჯობა",
      externalId: "mid_1",
    });
  });

  it("refuses an unsigned request", async () => {
    const raw = body();
    const res = await POST(post(raw, null));

    expect(res.status).toBe(403);
    expect(record).not.toHaveBeenCalled();
  });

  it("refuses a forged message signed with the wrong secret", async () => {
    // Without this the endpoint is an open door for putting words into a
    // customer's mouth and making the AI answer them.
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

  it("answers 200 for a page no tenant has connected", async () => {
    // A Meta app receives events for every page subscribed to it. An error here
    // would have Meta retry on a backoff and eventually disable the webhook for
    // everyone, over traffic that was never ours.
    record.mockResolvedValue(null);
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(notify).not.toHaveBeenCalled();
  });

  it("asks Meta to re-send when a message of ours could not be stored", async () => {
    // The alternative — answering ok — loses the message for good, because Meta
    // only re-sends what it thinks failed. The customer would then be waiting on
    // an answer to something nobody ever read.
    record.mockRejectedValue(new Error("database is down"));
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(500);
  });

  it("keeps the rest of a batch when one message fails", async () => {
    const raw = JSON.stringify({
      object: "page",
      entry: [
        {
          id: "PAGE_1",
          messaging: [
            { sender: { id: "PSID_1" }, message: { mid: "mid_1", text: "ერთი" } },
            { sender: { id: "PSID_2" }, message: { mid: "mid_2", text: "ორი" } },
          ],
        },
      ],
    });
    record
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({
        businessId: "b1",
        conversationId: "conv2",
        messageId: "m2",
        isNew: true,
      });

    const res = await POST(post(raw, sign(raw)));

    // 500 for the one that was lost, but the one that stored is still announced
    // — its customer is waiting, and Meta's re-send will skip it by its mid.
    expect(res.status).toBe(500);
    expect(record).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("does not ask for a re-send over a page nobody connected", async () => {
    // Nothing about the second delivery would be different, so a 500 here is an
    // endless retry of traffic that was never ours.
    record.mockResolvedValue(null);
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
  });

  it("tells the AI service about a new message", async () => {
    const raw = body();
    await POST(post(raw, sign(raw)));

    expect(notify).toHaveBeenCalledWith({
      event: "message.received",
      businessId: "b1",
      conversationId: "conv1",
      messageId: "m1",
      channel: "FACEBOOK",
    });
  });

  it("does not tell the AI service twice about a re-sent message", async () => {
    // Meta's retry is meant to be invisible. Announcing it again would have the
    // customer answered twice for one question.
    record.mockResolvedValue({
      businessId: "b1",
      conversationId: "conv1",
      messageId: "m1",
      isNew: false,
    });
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(notify).not.toHaveBeenCalled();
  });

  it("ignores an echo of our own reply", async () => {
    const raw = JSON.stringify({
      object: "page",
      entry: [
        {
          id: "PAGE_1",
          messaging: [
            { sender: { id: "PAGE_1" }, message: { mid: "mid_x", text: "ჩვენი პასუხი", is_echo: true } },
          ],
        },
      ],
    });

    expect((await POST(post(raw, sign(raw)))).status).toBe(200);
    expect(record).not.toHaveBeenCalled();
  });

  it("says 503 rather than accepting unsigned events when unconfigured", async () => {
    delete process.env.META_APP_SECRET;
    const raw = body();

    expect((await POST(post(raw, sign(raw)))).status).toBe(503);
    expect(record).not.toHaveBeenCalled();
  });
});
