import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { parseMessagingEvents, tokensMatch, verifySignature } from "./meta";

const SECRET = "app-secret-from-meta";

const sign = (body: string, secret = SECRET) =>
  `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;

/** The delivery shape Meta documents, trimmed to the fields we read. */
function delivery(messaging: unknown[], pageId = "PAGE_1") {
  return JSON.stringify({
    object: "page",
    entry: [{ id: pageId, time: 1_700_000_000, messaging }],
  });
}

const message = (over: Record<string, unknown> = {}) => ({
  sender: { id: "PSID_1" },
  recipient: { id: "PAGE_1" },
  timestamp: 1_700_000_000,
  message: { mid: "mid_1", text: "გამარჯობა", ...over },
});

describe("verifySignature()", () => {
  it("accepts a body signed with the app secret", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a body signed with a different secret", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body, "someone-elses-secret"), SECRET)).toBe(false);
  });

  it("rejects a body that was altered after signing", () => {
    const original = delivery([message()]);
    const signature = sign(original);
    const tampered = original.replace("გამარჯობა", "გადმომირიცხე ფული");
    expect(verifySignature(tampered, signature, SECRET)).toBe(false);
  });

  it("rejects a request with no signature at all", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, null, SECRET)).toBe(false);
    expect(verifySignature(body, undefined, SECRET)).toBe(false);
    expect(verifySignature(body, "", SECRET)).toBe(false);
  });

  it("rejects a signature that is not sha256", () => {
    const body = delivery([message()]);
    const md5ish = sign(body).replace("sha256=", "sha1=");
    expect(verifySignature(body, md5ish, SECRET)).toBe(false);
  });

  it("rejects malformed hex instead of throwing", () => {
    const body = delivery([message()]);
    expect(() => verifySignature(body, "sha256=zzzz", SECRET)).not.toThrow();
    expect(verifySignature(body, "sha256=zzzz", SECRET)).toBe(false);
  });

  it("is computed over the exact bytes received, not re-serialised JSON", () => {
    // Meta signs what it sent. Whitespace that JSON.parse would discard still
    // changes the digest, which is why the route must not re-stringify.
    const body = delivery([message()]);
    const signature = sign(body);
    const reserialised = JSON.stringify(JSON.parse(body), null, 2);
    expect(reserialised).not.toBe(body);
    expect(verifySignature(reserialised, signature, SECRET)).toBe(false);
  });
});

describe("tokensMatch()", () => {
  it("accepts the exact token", () => {
    expect(tokensMatch("verify-me-please", "verify-me-please")).toBe(true);
  });

  it("rejects a different or truncated token", () => {
    expect(tokensMatch("verify-me-pleas", "verify-me-please")).toBe(false);
    expect(tokensMatch("VERIFY-ME-PLEASE", "verify-me-please")).toBe(false);
    expect(tokensMatch("", "verify-me-please")).toBe(false);
  });
});

describe("parseMessagingEvents()", () => {
  it("pulls out the page, the sender, the text and the mid", () => {
    expect(parseMessagingEvents(JSON.parse(delivery([message()])))).toEqual([
      {
        pageId: "PAGE_1",
        senderId: "PSID_1",
        text: "გამარჯობა",
        externalId: "mid_1",
        platform: "page",
      },
    ]);
  });

  it("skips echoes of our own replies", () => {
    // The one that matters: an echo stored as a customer message makes the AI
    // read its own answer as a new question and reply to itself.
    const events = parseMessagingEvents(
      JSON.parse(delivery([message({ is_echo: true, text: "ჩვენი პასუხი" })])),
    );
    expect(events).toEqual([]);
  });

  it("skips delivery receipts, read receipts and postbacks", () => {
    const body = JSON.stringify({
      object: "page",
      entry: [
        {
          id: "PAGE_1",
          messaging: [
            { sender: { id: "PSID_1" }, delivery: { mids: ["mid_1"], watermark: 1 } },
            { sender: { id: "PSID_1" }, read: { watermark: 1 } },
            { sender: { id: "PSID_1" }, postback: { title: "დაწყება", payload: "START" } },
          ],
        },
      ],
    });
    expect(parseMessagingEvents(JSON.parse(body))).toEqual([]);
  });

  it("skips an attachment-only message", () => {
    const body = delivery([
      {
        sender: { id: "PSID_1" },
        message: { mid: "mid_2", attachments: [{ type: "image", payload: { url: "x" } }] },
      },
    ]);
    expect(parseMessagingEvents(JSON.parse(body))).toEqual([]);
  });

  it("keeps the good messages in a batch that also contains junk", () => {
    const body = JSON.stringify({
      object: "page",
      entry: [
        { id: "PAGE_1", messaging: [message()] },
        { id: null, messaging: [message()] },
        { id: "PAGE_2", messaging: [message({ mid: "mid_3", text: "hello" })] },
      ],
    });
    expect(parseMessagingEvents(JSON.parse(body)).map((m) => m.externalId)).toEqual([
      "mid_1",
      "mid_3",
    ]);
  });

  it("reads an Instagram delivery, which is the same shape with a different object", () => {
    // Instagram sends `entry[].messaging[]` exactly like a Page does — the ids
    // mean IGID and IGSID rather than page and PSID, but nothing here has to
    // know that. Only `platform` differs, and it is what routes the reply back.
    const body = delivery([message()], "IGID_1").replace('"object":"page"', '"object":"instagram"');
    expect(parseMessagingEvents(JSON.parse(body))).toEqual([
      {
        pageId: "IGID_1",
        senderId: "PSID_1",
        text: "გამარჯობა",
        externalId: "mid_1",
        platform: "instagram",
      },
    ]);
  });

  it("skips an Instagram echo too", () => {
    const body = delivery([message({ is_echo: true })], "IGID_1").replace(
      '"object":"page"',
      '"object":"instagram"',
    );
    expect(parseMessagingEvents(JSON.parse(body))).toEqual([]);
  });

  it("refuses a delivery for a platform we do not handle", () => {
    // WhatsApp comes through the same app but in a different envelope entirely
    // — `entry[].changes[]`, not `messaging[]`. Accepting the object would mean
    // reading fields that are not there and silently storing nothing.
    const body = delivery([message()]).replace(
      '"object":"page"',
      '"object":"whatsapp_business_account"',
    );
    expect(parseMessagingEvents(JSON.parse(body))).toEqual([]);
  });

  it("survives rubbish without throwing", () => {
    for (const junk of [null, undefined, 42, "page", [], {}, { object: "page" }]) {
      expect(parseMessagingEvents(junk)).toEqual([]);
    }
    expect(parseMessagingEvents({ object: "page", entry: "not-an-array" })).toEqual([]);
    expect(parseMessagingEvents({ object: "page", entry: [null, 1, "x"] })).toEqual([]);
  });
});

describe("the two envelope shapes", () => {
  it("reads a message wrapped in changes[] as well as messaging[]", () => {
    // Instagram Login can deliver the same event under `changes[]` with a
    // `field`. Reading only `messaging[]` loses it in the worst possible way:
    // the signature checks out, we answer 200, and nothing is stored.
    const body = {
      object: "instagram",
      entry: [
        {
          id: "IGID_1",
          changes: [
            {
              field: "messages",
              value: {
                sender: { id: "IGSID_1" },
                recipient: { id: "IGID_1" },
                message: { mid: "mid_c1", text: "გამარჯობა" },
              },
            },
          ],
        },
      ],
    };

    expect(parseMessagingEvents(body)).toEqual([
      {
        pageId: "IGID_1",
        senderId: "IGSID_1",
        text: "გამარჯობა",
        externalId: "mid_c1",
        platform: "instagram",
      },
    ]);
  });

  it("ignores changes that are not messages", () => {
    // Comments, mentions and story insights arrive on the same pipe. None of
    // them belong in a conversation.
    const body = {
      object: "instagram",
      entry: [
        {
          id: "IGID_1",
          changes: [
            { field: "comments", value: { id: "c1", text: "nice" } },
            { field: "mentions", value: { media_id: "m1" } },
          ],
        },
      ],
    };
    expect(parseMessagingEvents(body)).toEqual([]);
  });

  it("skips an echo delivered through changes[] too", () => {
    const body = {
      object: "instagram",
      entry: [
        {
          id: "IGID_1",
          changes: [
            {
              field: "messages",
              value: {
                sender: { id: "IGID_1" },
                message: { mid: "mid_e", text: "ჩვენი პასუხი", is_echo: true },
              },
            },
          ],
        },
      ],
    };
    expect(parseMessagingEvents(body)).toEqual([]);
  });

  it("takes both when one entry carries each", () => {
    const body = {
      object: "instagram",
      entry: [
        {
          id: "IGID_1",
          messaging: [{ sender: { id: "A" }, message: { mid: "mid_m", text: "ერთი" } }],
          changes: [
            {
              field: "messages",
              value: { sender: { id: "B" }, message: { mid: "mid_c", text: "ორი" } },
            },
          ],
        },
      ],
    };
    expect(parseMessagingEvents(body).map((m) => m.externalId)).toEqual(["mid_m", "mid_c"]);
  });
});
