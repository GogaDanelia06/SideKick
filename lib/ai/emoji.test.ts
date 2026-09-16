import { describe, it, expect } from "vitest";
import { stripEmoji } from "./emoji";

describe("stripEmoji()", () => {
  it("removes emoji together with the space before them", () => {
    expect(stripEmoji("Hi! 😄\n\nTake your time! I'm here to help. 🙌")).toBe(
      "Hi!\n\nTake your time! I'm here to help.",
    );
  });

  it("removes emoji at the start of a line and keeps its indentation", () => {
    expect(stripEmoji("😊 გამარჯობა!\n  - 🍕 პიცა")).toBe("გამარჯობა!\n  - პიცა");
  });

  it("removes runs, skin tones, flags, keycaps and joined emoji", () => {
    expect(stripEmoji("Deal 🔥🔥 👍🏽 🇬🇪 1️⃣ 👨‍💻 ❤️ done")).toBe("Deal done");
  });

  it("keeps text symbols and prices", () => {
    expect(stripEmoji("iPhone™ © 2026 — 2,499₾")).toBe("iPhone™ © 2026 — 2,499₾");
  });

  it("returns an empty string for a reply that was only emoji", () => {
    expect(stripEmoji(" 🙌 😄 ")).toBe("");
  });

  it("leaves emoji-free text untouched", () => {
    expect(stripEmoji("როგორ შემიძლია დაგეხმაროთ?")).toBe("როგორ შემიძლია დაგეხმაროთ?");
  });
});
