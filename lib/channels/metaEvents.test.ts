import { describe, it, expect } from "vitest";
import { parseMessagingEvents } from "./meta";
import { delivery, message } from "./metaTestKit";

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
