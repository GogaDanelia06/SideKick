import { describe, it, expect } from "vitest";
import { correctionInstruction } from "./correctionInstruction";

const thread = [
  { id: "1", sender: "CUSTOMER", text: "გამარჯობა" },
  { id: "2", sender: "AI", text: "გამარჯობა! რით დაგეხმაროთ?" },
  { id: "3", sender: "CUSTOMER", text: "როდის მუშაობთ?" },
  { id: "4", sender: "AI", text: "24/7 ვმუშაობთ." },
  { id: "5", sender: "CUSTOMER", text: "მადლობა" },
  { id: "6", sender: "AI", text: "არაფრის!" },
];

describe("correctionInstruction()", () => {
  it("quotes the wrong answer with the messages before it, and the owner's explanation", () => {
    const text = correctionInstruction(thread, ["4"], "  24/7-ს ნაცვლად თქვი „დღის ნებისმიერ დროს“ ");
    expect(text).toContain("ასისტენტი [არასწორი პასუხი]: 24/7 ვმუშაობთ.");
    expect(text).toContain("კლიენტი: როდის მუშაობთ?");
    expect(text).toContain("ასისტენტი: გამარჯობა! რით დაგეხმაროთ?");
    expect(text).not.toContain("მადლობა");
    expect(text?.endsWith("24/7-ს ნაცვლად თქვი „დღის ნებისმიერ დროს“")).toBe(true);
  });

  it("marks a gap between two separate parts of the chat", () => {
    const text = correctionInstruction(thread, ["2", "6"], "უფრო მოკლედ") ?? "";
    expect(text).toContain("…");
    expect(text.match(/\[არასწორი პასუხი\]/g)).toHaveLength(2);
  });

  it("refuses without an explanation or a message from this chat", () => {
    expect(correctionInstruction(thread, ["4"], "   ")).toBeNull();
    expect(correctionInstruction(thread, ["nope"], "ტექსტი")).toBeNull();
  });

  it("shortens a very long message", () => {
    const long = [{ id: "x", sender: "AI", text: "ა".repeat(2000) }];
    expect((correctionInstruction(long, ["x"], "მოკლედ") ?? "").length).toBeLessThan(900);
  });
});
