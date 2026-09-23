import { describe, it, expect } from "vitest";
import ka from "@/messages/ka.json";
import en from "@/messages/en.json";
import { message, textIn } from "./messages";

type Branch = { [key: string]: string | Branch };

function flatten(node: Branch, prefix = ""): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [name, value] of Object.entries(node)) {
    const key = `${prefix}${name}`;
    Object.assign(flat, typeof value === "string" ? { [key]: value } : flatten(value, `${key}.`));
  }
  return flat;
}

const georgian = flatten(ka as Branch);
const english = flatten(en as Branch);
const fillers = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/**
 * The two files are one catalogue in two languages: a key missing from either would
 * show an English string to a Georgian reader, or nothing at all.
 */
describe("the message catalogue", () => {
  it("holds the same keys in both languages", () => {
    expect(Object.keys(georgian).sort()).toEqual(Object.keys(english).sort());
  });

  it("has no empty message", () => {
    const blank = [...Object.entries(georgian), ...Object.entries(english)]
      .filter(([, text]) => text.trim() === "")
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });

  it("asks both languages for the same values", () => {
    const mismatched = Object.keys(georgian).filter(
      (key) => String(fillers(georgian[key])) !== String(fillers(english[key])),
    );
    expect(mismatched).toEqual([]);
  });
});

describe("message()", () => {
  it("answers in the language asked for", () => {
    expect(message("ka", "breadcrumbs.home")).toBe("მთავარი");
    expect(message("en", "breadcrumbs.home")).toBe("Home");
  });

  it("fills in the values a message asks for, and leaves the rest alone", () => {
    const filled = message("en", "dashboard.channels.view.planLimit", { plan: "Basic", limit: 2, used: 2 });
    expect(filled).toContain('"Basic"');
    expect(filled).not.toContain("{");
  });

  it("gives back the key itself when there is no such message", () => {
    // @ts-expect-error — the compiler refuses an unknown key; this is what happens if one slips through.
    expect(message("ka", "nothing.like.this")).toBe("nothing.like.this");
  });
});

describe("textIn()", () => {
  it("reads a key, and text the database holds, the same way", () => {
    expect(textIn("ka", "breadcrumbs.home")).toBe("მთავარი");
    expect(textIn("en", { ka: "ფასი", en: "Price" })).toBe("Price");
  });
});
