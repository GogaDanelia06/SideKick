import { describe, it, expect } from "vitest";
import { parseBlocks } from "./blocks";

describe("parseBlocks()", () => {
  it("reads headings, paragraphs and both kinds of list", () => {
    const source = "# ვინ ხარ\nშენ ხარ ასისტენტი.\nპასუხობ მოკლედ.\n\n## ფასები\n- ბეისიქი 49₾\n- სტანდარტი 99₾\n\n1. მიესალმე\n2. უპასუხე";
    expect(parseBlocks(source)).toEqual([
      { kind: "heading", level: 1, text: "ვინ ხარ" },
      { kind: "paragraph", text: "შენ ხარ ასისტენტი.\nპასუხობ მოკლედ." },
      { kind: "heading", level: 2, text: "ფასები" },
      { kind: "list", ordered: false, items: ["ბეისიქი 49₾", "სტანდარტი 99₾"] },
      { kind: "list", ordered: true, items: ["მიესალმე", "უპასუხე"] },
    ]);
  });

  it("keeps code, quotes and rules apart from the text around them", () => {
    const source = "> არ დაპირდე ფასდაკლებას\n> არასდროს\n---\n```\n# ეს სათაური არაა\n```\nბოლო";
    expect(parseBlocks(source)).toEqual([
      { kind: "quote", text: "არ დაპირდე ფასდაკლებას\nარასდროს" },
      { kind: "rule" },
      { kind: "code", text: "# ეს სათაური არაა" },
      { kind: "paragraph", text: "ბოლო" },
    ]);
  });

  it("treats a hash with no space, and plain text, as a paragraph", () => {
    expect(parseBlocks("#hashtag\r\nტექსტი")).toEqual([{ kind: "paragraph", text: "#hashtag\nტექსტი" }]);
    expect(parseBlocks("")).toEqual([]);
  });
});
