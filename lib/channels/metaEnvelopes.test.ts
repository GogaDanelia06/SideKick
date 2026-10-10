import { describe, it, expect } from "vitest";
import { parseMessagingEvents } from "./meta";

describe("the two envelope shapes", () => {
  it("reads a message wrapped in changes[] as well as messaging[]", () => {
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
