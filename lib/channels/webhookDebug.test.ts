import { describe as group, it, expect } from "vitest";
import { describe, redact, traceDelivery } from "./webhookDebug";

const delivery = {
  object: "instagram",
  entry: [
    {
      id: "17841436214263005",
      messaging: [
        {
          sender: { id: "IGSID_1" },
          message: { mid: "mid_1", text: "გამარჯობა, რა ღირს?" },
        },
      ],
    },
  ],
};

group("redact()", () => {
  it("keeps the envelope and removes what the customer wrote", () => {
    // Everything this project spent a week diagnosing was in the structure:
    // which object, which account id, which array. None of it was in the text.
    const out = redact(delivery) as typeof delivery;

    expect(out.object).toBe("instagram");
    expect(out.entry[0]!.id).toBe("17841436214263005");
    expect(out.entry[0]!.messaging[0]!.message.mid).toBe("mid_1");
    expect(out.entry[0]!.messaging[0]!.sender.id).toBe("IGSID_1");
    expect(out.entry[0]!.messaging[0]!.message.text).toBe("‹19 chars›");
  });

  it("reaches text nested under changes[] as well", () => {
    const out = redact({
      entry: [{ changes: [{ field: "messages", value: { message: { text: "hi" } } }] }],
    }) as { entry: { changes: { value: { message: { text: string } } }[] }[] };

    expect(out.entry[0]!.changes[0]!.value.message.text).toBe("‹2 chars›");
  });

  it("cannot be smuggled past by a customer typing the word text", () => {
    // A string-replace on the raw body would be fooled by this; walking the
    // parsed object is not.
    const out = redact({ entry: [{ messaging: [{ message: { text: '{"text":"secret"}' } }] }] }) as {
      entry: { messaging: { message: { text: string } }[] }[];
    };

    expect(out.entry[0]!.messaging[0]!.message.text).toBe("‹17 chars›");
  });

  it("survives nulls, arrays and primitives without throwing", () => {
    expect(redact(null)).toBeNull();
    expect(redact(42)).toBe(42);
    expect(redact([1, "a"])).toEqual([1, "a"]);
  });
});

group("traceDelivery()", () => {
  const req = (ua: string) =>
    new Request("https://sidekick.ge/api/webhooks/messenger", {
      method: "POST",
      headers: { "user-agent": ua, "x-hub-signature-256": "sha256=abc" },
    });

  it("carries the headers that identify the sender", () => {
    const t = traceDelivery(req("Webhooks/1.0"), JSON.stringify(delivery));

    expect(t.userAgent).toBe("Webhooks/1.0");
    expect(t.signature).toBe("sha256=abc");
    expect(t.body).not.toContain("გამარჯობა");
    expect(t.body).toContain("17841436214263005");
  });

  it("refuses to print a body it could not parse", () => {
    // If it is not JSON it is not a delivery, and it could be anything at all.
    const t = traceDelivery(req("curl"), "<html>not json</html>");

    expect(t.body).toBe("‹unparseable›");
    expect(t.bytes).toBe(21);
  });
});

group("describe()", () => {
  it("names the envelope shape without its contents", () => {
    expect(describe(delivery)).toBe(
      "object=instagram entry[0]={id,messaging} first={sender,message}",
    );
  });

  it("says what it got when handed something that is not a delivery", () => {
    expect(describe(null)).toBe("object");
    expect(describe("nope")).toBe("string");
  });
});
